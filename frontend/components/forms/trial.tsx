import { RequestData, RequestDataSchema, ResponseMessage, requestDataToJson, responseMessageFromJson } from "@/types";
import { Socket, io } from "socket.io-client";
import { EventObject, assign, emit, fromCallback, fromPromise, sendParent, setup } from "xstate";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
if (!SOCKET_URL) {
  throw new Error("Missing env variable NEXT_PUBLIC_SOCKET_URL");
}

const MAX_RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 2000;

const WebSocketContextSchema = z.object({
  socket: z.any().nullable(), // Can't directly validate Socket with Zod
  sessionId: z.string().nullable(),
  reconnectionAttempts: z.number(),
});

type WebSocketContext = z.infer<typeof WebSocketContextSchema>;

export const webSocketMachine = setup({
  types: {
    context: {} as WebSocketContext,
    events: {} as
      | { type: "parentActor.connect"; data: { sessionId: string } }
      | { type: "parentActor.sendMessage"; data: RequestData }
      | { type: "parentActor.disconnect" }
      | { type: "socketListener.messageReceived"; data: ResponseMessage }
      | { type: "socketListener.disconnected" },
  },
  actions: {
    sendMessage: ({ context, event }) => {
      if (event.type !== "parentActor.sendMessage") return;
      const message = RequestDataSchema.parse({
        ...event.data,
        sessionId: context.sessionId,
      });

      const snake_case_message = requestDataToJson(message);
      console.log("\n\n:===> Sending message:", snake_case_message, "\n\n");
      // context.socket?.emit("text_message", snake_case_message);
      context.socket?.send(snake_case_message.message);
    },
  },
  actors: {
    socketConnector: fromPromise(async ({ input }: { input: { sessionId: string } }): Promise<{ socket: WebSocket; data: ResponseMessage }> => {
      return new Promise((resolve, reject) => {
        console.log(SOCKET_URL)
        console.log(input)
        const socket = new WebSocket(SOCKET_URL + input.sessionId + "?save_chat=false")
        // const socket = new WebSocket(SOCKET_URL+ sessionId)
        // const socket = io(SOCKET_URL, {
        //   reconnectionAttempts: MAX_RECONNECTION_ATTEMPTS,
        //   reconnectionDelay: RECONNECTION_DELAY,
        // });
        socket.onopen = (event) => {
          console.log('Connected to WebSocket server');
          resolve({ socket, data: {} });

          // socket.send('Hello, server!');
          // socket.send(JSON.stringify({ type: 'connection_init' }));
          // resolve({ socket, data });
        };
    
        // socket.onmessage = (event) => {
        //   console.log("on message $$$$$$$$$$$$$$$$$ 1")
        //   const data = JSON.parse(event.data);
        //   if (data.type === 'connection_ack') {
        //     socket.send(JSON.stringify({ type: 'session_init', session_id: input.sessionId }));
        //   } else if (data.type === 'session_init') {
        //     console.log('Session init data:', data);
        //     resolve({ socket, data });
        //     // Handle session init data
        //   }
        // };
    
        
    
        
        // socket.on("connect", () => socket.emit("connection_init"));
        // socket.on("connection_ack", () => socket.emit("session_init", { session_id: input.sessionId }));
        // socket.on("session_init", (data: any) => {
        //   console.log("Session init data:", data);
        //   resolve({ socket, data });
        // });
        // socket.on("connect_error", reject);
      });
    }),
    socketListener: fromCallback<EventObject, { socket: WebSocket }>(({ sendBack, input }) => {
      const { socket } = input;

      const handleTextResponse = (data: unknown) => {
        try {
          console.log("\n\n:===========> Received message:", data, "\n\n");
          // const validatedData = responseMessageFromJson(data);
          //  console.log("\n\n:===> Received message11111111:", validatedData, "\n\n");
          //  validatedData["messageId"] = uuidv4()

          sendBack({ type: "socketListener.messageReceived", data: data });
        } catch (error) {
          console.error("Invalid response data:", error);
        }
      };
      socket.onmessage = (event) => {
        console.log("on message $$$$$$$$$$$$$$$$$ 2")
        const data = JSON.parse(event.data);
        handleTextResponse(data)
        // if (data.type === 'connection_ack') {
        //   socket.send(JSON.stringify({ type: 'session_init', session_id: input.sessionId }));
        // } else if (data.type === 'session_init') {
        // console.log('Session init data:', data);
          // resolve({ socket, data });
          // Handle session init data
        // }
      };

      socket.onclose = () => {
        console.log('Disconnected from WebSocket server');
      };
  

      socket.onerror = (error) => {
        console.error('WebSocket error: ', error);
        // reject(error);
      };
      // socket.on("text_response", handleTextResponse);
      // socket.on("disconnect", () => sendBack({ type: "socketListener.disconnected" }));

      return () => {
          socket.close()
        // socket.off("text_response", handleTextResponse);
        // socket.off("disconnect");
      };
    }),
  },
  guards: {
    canReconnect: ({ context }) => context.reconnectionAttempts < MAX_RECONNECTION_ATTEMPTS,
  },
}).createMachine({
  context: WebSocketContextSchema.parse({
    socket: null,
    sessionId: null,
    reconnectionAttempts: 0,
  }),
  id: "webSocketActor",
  initial: "idle",
  states: {
    idle: {
      on: {
        "parentActor.connect": {
          target: "connecting",
          actions: assign({
            sessionId: ({ event }) => event.data.sessionId,
            reconnectionAttempts: 0,
          }),
        },
      },
    },
    connecting: {
      invoke: {
        src: "socketConnector",
        input: ({ context }) => ({ sessionId: context.sessionId! }),
        onDone: {
          target: "connected",
          actions: [
            assign({ socket: ({ event }) => event.output.socket }),
            sendParent({ type: "webSocket.connected" }),
            emit({
              type: "notification",
              data: { type: "success", message: "Connected to the server" },
            }),
          ],
        },
        onError: {
          target: "reconnecting",
          actions: emit({
            type: "notification",
            data: { type: "error", message: "Failed to connect to the server" },
          }),
        },
      },
    },
    connected: {
      invoke: {
        src: "socketListener",
        input: ({ context }) => ({ socket: context.socket! }),
      },
      on: {
        "parentActor.sendMessage": { actions: "sendMessage" },
        "socketListener.messageReceived": {
          actions: sendParent(({ event }) => ({
            type: "webSocket.messageReceived",
            data: event.data,
          })),
        },
        "socketListener.disconnected": { target: "reconnecting" },
        "parentActor.disconnect": { target: "disconnecting" },
      },
    },
    reconnecting: {
      entry: assign({
        reconnectionAttempts: ({ context }) => context.reconnectionAttempts + 1,
      }),
      always: [
        {
          guard: "canReconnect",
          target: "idle",
          actions: emit({
            type: "notification",
            data: { type: "error", message: "Failed to reconnect after multiple attempts" },
          }),
        },
        { target: "connecting" },
      ],
    },
    disconnecting: {
      entry: [({ context }) => context.socket?.close(), sendParent({ type: "webSocket.disconnected" })],
      always: { target: "idle" },
    },
  },
});
// import { RequestData, RequestDataSchema, ResponseMessage, requestDataToJson, responseMessageFromJson } from "@/types";
// import { Socket, io } from "socket.io-client";
// import { EventObject, assign, emit, fromCallback, fromPromise, sendParent, setup } from "xstate";
// import { z } from "zod";
// import { v4 as uuidv4 } from "uuid";

// const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
// if (!SOCKET_URL) {
//   throw new Error("Missing env variable NEXT_PUBLIC_SOCKET_URL");
// }

// const MAX_RECONNECTION_ATTEMPTS = 5;
// const RECONNECTION_DELAY = 2000;

// // Schema for WebSocket context
// const WebSocketContextSchema = z.object({
//   socket: z.any().nullable(),
//   sessionId: z.string().nullable(),
//   reconnectionAttempts: z.number(),
// });

// type WebSocketContext = z.infer<typeof WebSocketContextSchema>;

// export const webSocketMachine = setup({
//   types: {
//     context: {} as WebSocketContext,
//     events: {} as
//       | { type: "parentActor.connect"; data: { sessionId: string } }
//       | { type: "parentActor.sendMessage"; data: RequestData }
//       | { type: "parentActor.disconnect" }
//       | { type: "socketListener.messageReceived"; data: ResponseMessage }
//       | { type: "socketListener.disconnected" },
//   },

//   actions: {
//     sendMessage: ({ context, event }) => {
//       if (event.type !== "parentActor.sendMessage") return;
//       const message = RequestDataSchema.parse({
//         ...event.data,
//         sessionId: context.sessionId,
//       });

//       const snake_case_message = requestDataToJson(message);
//       console.log("\n\n:===> Sending message:", snake_case_message, "\n\n");
//       context.socket?.send(snake_case_message.message);
//     },
//   },

//   actors: {
//     socketConnector: fromPromise(async ({ input }: { input: { sessionId: string } }): Promise<{ socket: WebSocket; data: ResponseMessage }> => {
//       return new Promise((resolve, reject) => {
//         const socket = new WebSocket(SOCKET_URL + input.sessionId + "?save_chat=false");

//         socket.onopen = () => {
//           console.log('Connected to WebSocket server');
//           resolve({ socket, data: {} });
//         };

//         socket.onerror = (error) => {
//           console.error('WebSocket error: ', error);
//           reject(error);
//         };

//         socket.onclose = () => {
//           console.log('Disconnected from WebSocket server');
//         };
//       });
//     }),

//     socketListener: fromCallback<EventObject, { socket: WebSocket }>(({ sendBack, input }) => {
//       const { socket } = input;

//       const handleTextResponse = (data: unknown) => {
//         try {
//           console.log("\n\n:===========> Received message:", data, "\n\n");
//           // const validatedData = responseMessageFromJson(data);
//           // validatedData["messageId"] = uuidv4();

//           sendBack({ type: "socketListener.messageReceived", data: data });
//         } catch (error) {
//           console.error("Invalid response data:", error);
//         }
//       };

//       socket.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         handleTextResponse(data);
//       };

//       socket.onclose = () => {
//         console.log('Disconnected from WebSocket server');
//         sendBack({ type: "socketListener.disconnected" });
//       };

//       socket.onerror = (error) => {
//         console.error('WebSocket error: ', error);
//       };

//       return () => {
//         socket.close();
//       };
//     }),
//   },

//   guards: {
//     canReconnect: ({ context }) => context.reconnectionAttempts < MAX_RECONNECTION_ATTEMPTS,
//   },

// }).createMachine({
//   context: WebSocketContextSchema.parse({
//     socket: null,
//     sessionId: localStorage.getItem("sessionId") || null,  
//     reconnectionAttempts: 0,
//   }),
//   id: "webSocketActor",
//   initial: "idle",
//   states: {
//     idle: {
//       on: {
//         "parentActor.connect": {
//           target: "connecting",
//           actions: assign({
//             sessionId: ({ event }) => event.data.sessionId,
//             reconnectionAttempts: 0,
//           }),
//         },
//       },
//     },
//     connecting: {
//       invoke: {
//         src: "socketConnector",
//         input: ({ context }) => ({ sessionId: context.sessionId! }),
//         onDone: {
//           target: "connected",
//           actions: [
//             assign({ socket: ({ event }) => event.output.socket }),
//             sendParent({ type: "webSocket.connected" }),
//             emit({
//               type: "notification",
//               data: { type: "success", message: "Connected to the server" },
//             }),
//           ],
//         },
//         onError: {
//           target: "reconnecting",
//           actions: emit({
//             type: "notification",
//             data: { type: "error", message: "Failed to connect to the server" },
//           }),
//         },
//       },
//     },
//     connected: {
//       invoke: {
//         src: "socketListener",
//         input: ({ context }) => ({ socket: context.socket! }),
//       },
//       on: {
//         "parentActor.sendMessage": { actions: "sendMessage" },
//         "socketListener.messageReceived": {
//           actions: sendParent(({ event }) => ({
//             type: "webSocket.messageReceived",
//             data: event.data,
//           })),
//         },
//         "socketListener.disconnected": { target: "reconnecting" },
//         "parentActor.disconnect": { target: "disconnecting" },
//       },
//     },
//     reconnecting: {
//       entry: assign({
//         reconnectionAttempts: ({ context }) => context.reconnectionAttempts + 1,
//       }),
//       always: [
//         {
//           guard: "canReconnect",
//           target: "idle",
//           actions: emit({
//             type: "notification",
//             data: { type: "error", message: "Failed to reconnect after multiple attempts" },
//           }),
//         },
//         { target: "connecting" },
//       ],
//     },
//     disconnecting: {
//       entry: [({ context }) => context.socket?.close(), sendParent({ type: "webSocket.disconnected" })],
//       always: { target: "idle" },
//     },
//   },
// });
