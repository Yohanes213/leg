import { assign, createMachine } from "xstate";

export interface ContextMachineContext {
  contexts: any[];
  context: any | null;
  currentPage: number;
  totalContexts: number;
  error: string | null;
}

export type ContextMachineEvent =
  | { type: "FETCH_CONTEXTS" }
  | { type: "FETCH_CONTEXTS_SUCCESS"; contexts: any[]; totalContexts: number }
  | { type: "FETCH_CONTEXTS_ERROR"; error: string }
  | { type: "SELECT_CONTEXT"; context: any }
  | { type: "ADD_CONTEXT" }
  | { type: "CLOSE_CONTEXT" }
  | { type: "APPLY_FILTER"; filters: Record<string, string> }
  | { type: "NEXT_PAGE" }
  | { type: "PREVIOUS_PAGE" };

export const contextMachine = createMachine(
  {
    id: "context",
    initial: "idle",
    context: {
      contexts: [],
      context: null,
      currentPage: 0,
      totalContexts: 0,
      error: null,
    },
    states: {
      idle: {
        on: {
          FETCH_CONTEXTS: "fetchingContexts",
        },
      },
      fetchingContexts: {
        on: {
          FETCH_CONTEXTS_SUCCESS: {
            target: "displayingContextsTable",
            actions: "setContextsData",
          },
          FETCH_CONTEXTS_ERROR: {
            target: "idle",
            actions: "setError",
          },
        },
      },
      displayingContextsTable: {
        on: {
          SELECT_CONTEXT: {
            target: "displayingContextDetail",
            actions: "setSelectedContext",
          },
          ADD_CONTEXT: "addingContext",
          APPLY_FILTER: {
            target: "fetchingContexts",
            actions: "resetPage",
          },
          NEXT_PAGE: {
            target: "fetchingContexts",
            actions: "incrementPage",
          },
          PREVIOUS_PAGE: {
            target: "fetchingContexts",
            actions: "decrementPage",
          },
        },
      },
      displayingContextDetail: {
        on: {
          CLOSE_CONTEXT: "displayingContextsTable",
        },
      },
      addingContext: {
        on: {
          CLOSE_CONTEXT: "displayingContextsTable",
        },
      },
    },
  },
  {
    actions: {
      setContextsData: assign((_, event: any) => ({
        contexts: event.contexts,
        totalContexts: event.totalContexts,
      })),
      setSelectedContext: assign({
        context: (_, event: any) => event.context,
      }),
      setError: assign({
        error: (_, event: any) => event.error,
      }),
      resetPage: assign({
        currentPage: 0,
      }),
      incrementPage: assign({
        currentPage: (context) => context.currentPage + 1,
      }),
      decrementPage: assign({
        currentPage: (context) => Math.max(0, context.currentPage - 1),
      }),
    },
  }
);
