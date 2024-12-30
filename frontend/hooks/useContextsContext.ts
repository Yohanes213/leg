import { convertStateToString } from "@/lib/stateToStr";
import { contextMachine } from "@/machines/contextMachine";
import { useSelector } from "@xstate/react";
import { useCallback, useMemo } from "react";
import { useAppContext } from "./useAppContext";
import { useToast } from "./useToast";

export enum ContextState {
  Idle = "Idle",
  FetchingContexts = "FetchingContexts",
  DisplayingContextsTable = "DisplayingContextsTable",
  DisplayingContextDetailModal = "DisplayingContextDetailModal",
  DisplayingAddContextForm = "DisplayingAddContextForm",
}

export enum DisplayContextState {
  Idle = "Idle",
  DisplayingContext = "DisplayingContext",
  DisplayingUpdateContextForm = "DisplayingUpdateContextForm",
  DisplayingDeleteContextForm = "DisplayingDeleteContextForm",
  UpdatingContext = "UpdatingContext",
  DeletingContext = "DeletingContext",
}

export enum AddContextState {
  Idle = "Idle",
  DisplayingForm = "DisplayingForm",
  AddingContext = "AddingContext",
}

const contextStateMap: Record<string, ContextState> = {
  idle: ContextState.Idle,
  "displayingContexts.fetchingContexts": ContextState.FetchingContexts,
  "displayingContexts.displayingContextsTable": ContextState.DisplayingContextsTable,
  "displayingContexts.displayingContextDetailModal": ContextState.DisplayingContextDetailModal,
  "displayingContexts.displayingAddContextForm": ContextState.DisplayingAddContextForm,
};

const displayContextStateMap: Record<string, DisplayContextState> = {
  "displayingContexts.displayingContextDetailModal.displayingContext": DisplayContextState.DisplayingContext,
  "displayingContexts.displayingContextDetailModal.displayingUpdateContextForm": DisplayContextState.DisplayingUpdateContextForm,
  "displayingContexts.displayingContextDetailModal.displayingDeleteContextForm": DisplayContextState.DisplayingDeleteContextForm,
  "displayingContexts.displayingContextDetailModal.updatingContext": DisplayContextState.UpdatingContext,
  "displayingContexts.displayingContextDetailModal.deletingContext": DisplayContextState.DeletingContext,
};

const addContextStateMap: Record<string, AddContextState> = {
  "displayingContexts.displayingAddContextForm": AddContextState.DisplayingForm,
  "displayingContexts.addingContext": AddContextState.AddingContext,
};

export const useContextsContext = () => {
  const { actorRef } = useAppContext();
  const contextActorRef = actorRef.context;
  // console.log('Context actor state:', contextActorRef.getSnapshot());
  // console.log('Context actor can handle events:', contextActorRef.getSnapshot().can);
  const contextActorState = useSelector(contextActorRef, (state) => state);
  useToast(contextActorRef);

  const contextState = useMemo(() => {
    if (!contextActorState) return ContextState.Idle;
    const currentState = convertStateToString(contextActorState.value as any);
    return contextStateMap[currentState] || ContextState.Idle;
  }, [contextActorState]);

  const displayContextState = useMemo(() => {
    const currentState = convertStateToString(contextActorState.value as any);
    return displayContextStateMap[currentState] || DisplayContextState.Idle;
  }, [contextActorState]);

  const addContextState = useMemo(() => {
    const currentState = convertStateToString(contextActorState.value as any);
    return addContextStateMap[currentState] || AddContextState.Idle;
  }, [contextActorState]);

  const contextDispatch = useCallback(
    
    (action: Parameters<typeof contextMachine.transition>[1]) => {
      console.log('useContextsContext: Dispatching action:', action);
      console.log('Actor status before dispatch:', contextActorRef.getSnapshot().value);
      contextActorRef?.send(action);
      console.log('Actor status after dispatch:', contextActorRef.getSnapshot().value);
    },
    [contextActorRef]
  );

  return {
    state: {
      contextState,
      displayContextState,
      addContextState,
    },
    data: {
      context: useSelector(contextActorRef, (state) => state?.context.context || null),
      contexts: useSelector(contextActorRef, (state) => state?.context.contexts || []),
      currentPage: useSelector(contextActorRef, (state) => state?.context.currentPage || 0),
      totalContexts: useSelector(contextActorRef, (state) => state?.context.totalContexts || 0),
      filter: useSelector(contextActorRef, (state) => state?.context.filter),
    },
    actions: {
      click: {
        selectContext: (context: any) => contextDispatch({ type: "user.selectContext", context }),
        selectUpdateContext: () => contextDispatch({ type: "user.selectUpdateContext" }),
        selectDeleteContext: () => contextDispatch({ type: "user.selectDeleteContext" }),
        addContext: () => contextDispatch({ type: "user.addContext" }),
        nextPage: () => contextDispatch({ type: "user.nextPage" }),
        previousPage: () => contextDispatch({ type: "user.previousPage" }),
      },
      submit: {
        deleteContext: (id: string) => contextDispatch({ type: "user.submitDeleteContext", id }),
        updateContext: (contextData: any) => contextDispatch({ type: "user.submitUpdateContext", contextData }),
        addContext: (contextData: any) => contextDispatch({ type: "user.submitAddContext", contextData }),
        applyFilter: (filter: Record<string, string>) => contextDispatch({ type: "user.applyFilter", filter }),
      },
      close: {
        contextDetailModal: () => contextDispatch({ type: "user.closeContextDetailModal" }),
        addContext: () => contextDispatch({ type: "user.closeAddContext" }),
      },
      cancel: {
        contextUpdate: () => contextDispatch({ type: "user.cancelContextUpdate" }),
        addContext: () => contextDispatch({ type: "user.cancelAddContext" }),
      },
      // fetch: {
      //   contexts: () => contextDispatch({ type: "app.startManagingContexts" }),
      // },
      fetch: {
        contexts: (searchQuery?: string) => contextDispatch({ 
          type: "app.startManagingContexts", 
          searchQuery 
        }),
    }
    },
  };
};

export type ContextData = ReturnType<typeof useContextsContext>["data"];
export type ContextActions = ReturnType<typeof useContextsContext>["actions"];
