import { apiCall } from "@/lib/api";
import { ActorRefFrom, assign, ContextFrom, emit, fromPromise, setup } from "xstate";
import { z } from "zod";

const PAGE_SIZE = 8;

const ContextSchema = z.object({
  id: z.string(),
  // article_name: z.string(),
  // article_detail: z.string().optional(),
  content: z.string().optional(), 
    tags: z.string().optional(),// JSON string, can be parsed into a Tag object
    metadata: z.string().optional(), // JSON string, can be parsed into Metadata object
    description: z.string().optional(), 
    date_to: z.string().optional(),  // ISO 8601 date string or null
    category: z.string().optional(), // JSON string, can be parsed into a Category object
    entry_to_force: z.string().optional(), // ISO 8601 date string
    publication_date: z.string().optional(), // 
    date: z.string().optional(), // ISO 8601 date string
    hearing_date: z.string().optional(), // ISO 8601 date string
  // Add other context fields as needed
});

const ContextMachineContextSchema = z.object({
  context: ContextSchema.optional(),
  contexts: z.array(ContextSchema),
  currentPage: z.number(),
  totalContexts: z.number(),
  filter: z.record(z.string(), z.number()).optional(),
  searchQuery: z.string().optional(),
  page: z.number().default(0),
  size: z.number().default(10),
});

type ContextMachineContext = z.infer<typeof ContextMachineContextSchema>;

export const contextMachine = setup({
  types: {
    context: {} as ContextMachineContext,
    events: {} as
      | { type: "app.startManagingContexts" ; searchQuery?: string }
      | { type: "app.stopManagingContexts" }
      | { type: "user.addContext" }
      | { type: "user.selectContext"; context: any }
      | { type: "user.closeAddContext" }
      | { type: "user.closeContextDetailModal" }
      | { type: "user.selectUpdateContext" }
      | { type: "user.selectDeleteContext" }
      | { type: "user.submitDeleteContext"; id: string }
      | { type: "user.submitUpdateContext"; contextData: any }
      | { type: "user.cancelContextUpdate" }
      | { type: "user.submitAddContext"; contextData: any }
      | { type: "user.cancelAddContext" }
      | { type: "user.nextPage" }
      | { type: "user.previousPage" }
      | { type: "user.applyFilter"; filter: Record<string, string> },
  },
  actors: {
    contextUpdater: fromPromise(async ({ input }: { input: { id: string; contextData: any } }) => {
      const response = await apiCall("PUT", `/contexts/${input.id}`, input.contextData);
      if (response.message) return input.contextData;
      throw new Error("Failed to update context");
    }),

    contextDeleter: fromPromise(async ({ input }: { input: { id: string } }) => {
      const response = await apiCall("DELETE", `/contexts/${input.id}`);
      if (response.message) return response;
      throw new Error("Failed to delete context");
    }),

    contextAdder: fromPromise(async ({ input }: { input: { contextData: any } }) => {
      const response = await apiCall("POST", "/contexts", input.contextData);
      if (response.id) return response;
      throw new Error("Failed to add context");
    }),

    contextsFetcher: fromPromise(async ({ input }: { input: { page: number; pageSize: number; filter?: Record<string, string>; } }) => {
      console.log("################ Input Params ################");
      console.log(input, "Input Params");
  
      // Initialize query parameters with page and size
      const queryParams = new URLSearchParams({
          page: (input.page + 1).toString(),  // Pagination starts at 1, so we add 1
          size: input.pageSize.toString(),  // Page size
      });
  
      // Initialize the data payload with pagination and filters
      let data: Record<string, any> = {
          page: input.page + 1,  // Backend typically expects 1-based pagination
          size: input.pageSize,  // Number of items per page
      };
  
      // Always include searchQuery in the data payload (this should be passed with every request)
      // if (input.searchQuery) {
      //     data["context"] = input.searchQuery;  // Search term in the data payload
      //     queryParams.append("context", input.searchQuery);  // Optionally add search term to query parameters for consistency
      //     console.log("Search Query Included:", input.searchQuery);
      // }
      if (input.filter && Object.keys(input.filter).length > 0) {
        queryParams.append("filter", JSON.stringify(input.filter));
      }

      // Add any filters to the payload if provided
      if (input.filter && Object.keys(input.filter).length > 0) {
          data["filter"] = input.filter;
      }
  
      // Log to check data and query parameters
      console.log("################ Prepared Payload ################");
      console.log(data, "Payload Data");
      console.log(queryParams.toString(), "Quooooooooooooooery Parameters");
  
      try {
          const response = await apiCall("POST", `/random_articles?${queryParams.toString()}`);
  
          console.log("################ API Response ################");
          console.log(response);
  
          return {
              contexts: response["articles"] || [],
              totalContexts: response["totalarticles"] || 0,
          };
      } catch (error) {
          console.error("Error Fetching Contexts:", error);
          return {
              contexts: [],
              // totalContexts: 0,
          };
      }
  }),
  
  },
  guards: {
    canGoToNextPage: ({ context }) => (context.currentPage + 1) * PAGE_SIZE < context.totalContexts,
    canGoToPreviousPage: ({ context }) => context.currentPage > 0,
  },
}).createMachine({
  context: ContextMachineContextSchema.parse({
    context: undefined,
    contexts: [],
    currentPage: 0,
    totalContexts: 0,
    filter: undefined,
  }),
  id: "contextActor",
  initial: "idle",
  states: {
    idle: {
        entry: () => {
            console.log('contextMachine: Entered idle state');
          },
      on: {
        "app.startManagingContexts": {
          target: "displayingContexts",
          actions: () => {
            console.log('contextMachine: Processing startManagingContexts event, transitioning to displayingContexts');
          }
        },
      },
    },
    displayingContexts: {
      initial: "fetchingContexts",
      entry: () => {
        console.log('contextMachine: Entered displayingContexts state');
      },
      // entry: () => {
      //   console.log('contextMachine: Entered displayingContexts state');
      // },
      on: {
        "app.stopManagingContexts": {
          target: "idle",
        },
      },
      states: {
        fetchingContexts: {
            // entry: () => {
            //     console.log('contextMachine: Entered fetchingContexts state');
            //   },
            
          invoke: {
            id: "contextsFetcher",
            // input: ({ context, event }) => ({
            //   page: context.currentPage,
            //   pageSize: PAGE_SIZE,
            //   filter: context.filter,
            //   searchQuery: event.type === "app.startManagingContexts" ? event.searchQuery : undefined
            // }),
            input: ({ context }) => ({
              page: context.currentPage,
              pageSize: PAGE_SIZE,
              filter: context.filter,
            }),
            onDone: {
              target: "displayingContextsTable",
              actions: assign({
                contexts: ({ event }) => event.output.contexts,
                totalContexts: ({ event }) => event.output.totalContexts,
              }),
              // target: "displayingContextsTable",
              // actions: assign({
              //   contexts: ({ event }) => {
              //     console.log("onDone event", event);  // ADD THIS LINE
              //     return event.output.contexts;
              //   },
              //   totalContexts: ({ event }) => event.output.totalContexts,
              // }),
            },
            onError: {
              target: "#contextActor.idle",
              actions: emit({
                type: "notification",
                data: {
                  type: "error",
                  message: "Failed to fetch contexts",
                },
              }),
            },
            src: "contextsFetcher",
          },
        },
        displayingContextsTable: {
          entry: () => {
            console.log('Entered displayingContextsTable state');
          },
          on: {
            // "app.startManagingContexts": {
            //   target: "fetchingContexts",
            //   actions: assign({
            //     searchQuery: ({ event }) => event.searchQuery
            //   })
            // },
            "user.selectContext": {
              target: "displayingContextDetailModal",
              actions: assign({ context: ({ event }) => event.context }),
            },
            "user.addContext": {
              target: "displayingAddContextForm",
            },
            "user.nextPage": {
              target: "fetchingContexts",
              actions: assign({
                currentPage: ({ context }) => context.currentPage + 1,
              }),
              guard: {
                type: "canGoToNextPage",
              },
            },
            "user.previousPage": {
              target: "fetchingContexts",
              actions: assign({
                currentPage: ({ context }) => Math.max(0, context.currentPage - 1),
              }),
              guard: {
                type: "canGoToPreviousPage",
              },
            },
            "user.applyFilter": {
              target: "fetchingContexts",
              actions: assign({
                filter: ({ event }) => event.filter,
                currentPage: 0,
              }),
            },
          },
        },
        displayingContextDetailModal: {
          initial: "displayingContext",
          on: {
            "user.closeContextDetailModal": {
              target: "displayingContextsTable",
            },
          },
          states: {
            displayingContext: {
              on: {
                "user.selectUpdateContext": {
                  target: "displayingUpdateContextForm",
                },
                "user.selectDeleteContext": {
                  target: "displayingDeleteContextForm",
                },
              },
            },
            displayingUpdateContextForm: {
              on: {
                "user.submitUpdateContext": {
                  target: "updatingContext",
                },
                "user.cancelContextUpdate": {
                  target: "displayingContext",
                },
              },
            },
            displayingDeleteContextForm: {
              on: {
                "user.submitDeleteContext": {
                  target: "deletingContext",
                },
              },
            },
            updatingContext: {
              invoke: {
                id: "contextUpdater",
                input: ({ context, event }) => ({
                  id: context.context?.id,
                  contextData: event.type === "user.submitUpdateContext" ? event.contextData : undefined,
                }),
                onDone: {
                  target: "displayingContext",
                  actions: [
                    assign({
                      context: ({ event }) => event.output,
                      contexts: ({ context, event }) => 
                        context.contexts.map(c => c.id === event.output.id ? event.output : c),
                    }),
                    emit({
                      type: "notification",
                      data: {
                        type: "success",
                        message: "Context updated successfully",
                      },
                    }),
                  ],
                },
                onError: {
                  target: "displayingUpdateContextForm",
                  actions: emit({
                    type: "notification",
                    data: {
                      type: "error",
                      message: "Failed to update context",
                    },
                  }),
                },
                src: "contextUpdater",
              },
            },
            deletingContext: {
              invoke: {
                id: "contextDeleter",
                input: ({ context }) => ({
                  id: context.context?.id!,
                }),
                onDone: {
                  target: "#contextActor.displayingContexts.fetchingContexts",
                  actions: emit({
                    type: "notification",
                    data: {
                      type: "success",
                      message: "Context deleted successfully",
                    },
                  }),
                },
                onError: {
                  target: "displayingDeleteContextForm",
                  actions: emit({
                    type: "notification",
                    data: {
                      type: "error",
                      message: "Failed to delete context",
                    },
                  }),
                },
                src: "contextDeleter",
              },
            },
          },
        },
        displayingAddContextForm: {
          on: {
            "user.submitAddContext": {
              target: "addingContext",
            },
            "user.closeAddContext": {
              target: "displayingContextsTable",
            },
            "user.cancelAddContext": {
              target: "displayingContextsTable",
            },
          },
        },
        addingContext: {
          invoke: {
            id: "contextAdder",
            input: ({ event }) => ({
              contextData: event.type === "user.submitAddContext" ? event.contextData : undefined,
            }),
            onDone: {
              target: "fetchingContexts",
              actions: emit({
                type: "notification",
                data: {
                  type: "success",
                  message: "Context added successfully",
                },
              }),
            },
            onError: {
              target: "displayingAddContextForm",
              actions: emit({
                type: "notification",
                data: {
                  type: "error",
                  message: "Failed to add context",
                },
              }),
            },
            src: "contextAdder",
          },
        },
      },
    },
  },
});

export const serializeContextState = (contextRef: ActorRefFrom<typeof contextMachine>) => {
  const snapshot = contextRef.getSnapshot();
  return {
    contexts: snapshot.context.contexts,
    currentPage: snapshot.context.currentPage,
    totalContexts: snapshot.context.totalContexts,
    filter: snapshot.context.filter,
    currentState: snapshot.value,
  };
};

export const deserializeContextState = (savedState: unknown): ContextFrom<typeof contextMachine> => {
  const parsedState = ContextMachineContextSchema.parse(savedState);
  return {
    ...parsedState,
    context: undefined,
  };
};
