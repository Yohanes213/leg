import {
    Architecture,
    ArchitectureSchema,
    ChatHistory,
    ChatHistoryItemSchema,
    HistoryManagement,
    HistoryManagementSchema,
    Model,
    ModelSchema,
    RequestDataSchema,
    RequestMessage,
    ResponseMessage,
    ResponseMessageSchema,
    ChatResponseSchema
  } from "@/types";
  import { v4 as uuidv4 } from "uuid";
  import { ActorRefFrom, assign, ContextFrom, sendTo, setup } from "xstate";
  import { z } from "zod";
  import { webSocketMachine } from "./webSocketMachine";
  
  const ChatContextSchema = z.object({
    sessionId: z.string(),
    webSocketRef: z.any(), 
    chatHistory: z.array(ChatHistoryItemSchema),
    model: ModelSchema,
    architecture: ArchitectureSchema,
    historyManagement: HistoryManagementSchema,
  });
  
  type ChatContext = z.infer<typeof ChatContextSchema>;
  
  export const chatMachine = setup({
    types: {
      context: {} as ChatContext,
      input: {} as {
        sessionId?: string;
        chatHistory?: ChatHistory;
        model: Model;
        architecture: Architecture;
        historyManagement: HistoryManagement;
      },
      events: {} as
        | { type: "app.startChat" }
        | { type: "app.stopChat" }
        | { type: "app.updateState"; data: { model: Model; architecture: Architecture; historyManagement: HistoryManagement } }
        | { type: "webSocket.connected"; data:{sessionId: string}}
        | { type: "webSocket.messageReceived"; data: ResponseMessage }
        | { type: "webSocket.disconnected" }
        | { type: "user.sendMessage"; messageId: string; message: string },
    },
  }).createMachine({
    context: ({ input, spawn }) =>
  
      ChatContextSchema.parse({
        sessionId: input?.sessionId || uuidv4(),
        webSocketRef: spawn(webSocketMachine),
        chatHistory: input?.chatHistory || [],
        model: input.model,
        architecture: input.architecture,
        historyManagement: input.historyManagement,
      }),
    id: "chatActor",
    initial: "idle",
    on: {
      "app.updateState": {
        actions: assign(({ context, event }) => ({
          model: event.data.model,
          architecture: event.data.architecture,
          historyManagement: event.data.historyManagement,
        })),
      },
    },
    states: {
      idle: {
        on: {
          "app.startChat": { target: "connecting" },
        },
      },
      connecting: {
        entry: sendTo(
          ({ context }) => context.webSocketRef,
          ({ context }) => ({
            type: "parentActor.connect",
            data: { sessionId: context.sessionId },
          })
        ),
        on: {
          "webSocket.connected": { 
          target: "chatting" ,
          actions: assign({
            // sessionId: ({event}) => event.data.sessionId,
            sessionId: ({event}) => {
              console.log("Session ID received from WebSocket111111111111111111:", event.data.sessionId);
              return event.data.sessionId;
            },
            // console.log("hellooooooooooooooo",sessionId)
          }),
        }
        },
      },
      chatting: {
        initial: "awaitingUserInput",
        on: {
          "app.stopChat": {
            target: "disconnecting",
          },
          "webSocket.disconnected": {
            target: "connecting",
          },
        },
        states: {
          awaitingUserInput: {
            on: {
              "user.sendMessage": {
                target: "waitingForResponse",
                actions: [
                  sendTo(
                    ({ context }) => context.webSocketRef,
                    ({ context, event }) => ({
                      type: "parentActor.sendMessage",
                      data: RequestDataSchema.parse({
                        type: "textMessage",
                        sessionId: context.sessionId,
                        messageId: event.messageId,
                        message: event.message,
                        timestamp: new Date().toISOString(),
                        model: context.model,
                        architectureChoice: context.architecture,
                        historyManagementChoice: context.historyManagement,
                      }),
                    })
                  ),
                  assign({
                    chatHistory: ({ context, event }) => [
                      ...context.chatHistory,
                      {
                        messageId: event.messageId,
                        timestamp: new Date(),
                        isUserMessage: true,
                        isComplete: true,
                        model: context.model,
                        architectureChoice: context.architecture,
                        historyManagementChoice: context.historyManagement,
                        message: event.message,
                      } as RequestMessage,
                    ],
                  }),
                ],
              },
            },
          },
          waitingForResponse: {
            on: {
              "webSocket.messageReceived": [
                {
                  guard: ({event}) => {
                    console.log("yyyyyyyyyyyy",event.data)
                    const parsed = ResponseMessageSchema.safeParse(event.data);
                    // Check if response type is "chat"
                    console.log("uuuuuuuuuuuuuuuuuuuuuuu", parsed)
                    return parsed.success && parsed.data.type === 'chat';
                  },
                  target: "awaitingUserInput", // Move to awaitingUserInput if type is "chat"
                  actions: [
                    assign({
                      chatHistory: ({context,event}) => {
                        console.log("Response from backend (chat type):", event.data);  // Log the response data
                        return [...context.chatHistory, event.data];
                      },
                    }),
                  ],
                },
                {
                  guard: ({event}) => {
                    const parsed = ResponseMessageSchema.safeParse(event.data);
                    console.log("Parsed response:", parsed);
                    // Check if response type is NOT "chat"
                    return parsed.success && parsed.data.type !== 'chat';
                  },
                  target: "waitingForResponse", 
                  actions: [
                    assign({
                      chatHistory: ({context,event}) => {
                        console.log("Response from backend (non-chat type), waiting for another response:", event.data);  // Log non-chat response
                        return [...context.chatHistory, event.data];
                      },
                    }),
                  ],
                },
              ],
            },
          },
        },
      },
      disconnecting: {
        entry: sendTo(({ context }) => context.webSocketRef, { type: "parentActor.disconnect" }),
        on: {
          "webSocket.disconnected": { target: "idle" },
        },
      },
    },
  });
  
  export const logSessionIdOnConnection = (sessionId: string) => {
    console.log("WebSocket connected with sessionId:", sessionId);
  };
  
  export const serializeChatState = (chatRef: ActorRefFrom<typeof chatMachine>) => {
    const snapshot = chatRef.getSnapshot();
    console.log("snapshot being loaded")
    console.log(snapshot)
    return {
      sessionId: snapshot.context.sessionId,
      chatHistory: snapshot.context.chatHistory,
      model: snapshot.context.model,
      architecture: snapshot.context.architecture,
      historyManagement: snapshot.context.historyManagement,
      currentState: snapshot.value,
    };
  };
  
  export const deserializeChatState = (savedState: unknown): ContextFrom<typeof chatMachine> => {
    console.log("deserialization11111111111111",savedState)
  
    const parsedState = ChatContextSchema.parse(savedState);
    console.log("deserialization",parsedState)
    // parsedState.sessionId = uuidv4()
    console.log(parsedState)
    
    return {
      ...parsedState,
      webSocketRef: undefined, // Will be re-spawned when the machine starts
    };
  };
  
  