import { convertStateToString } from "@/lib/stateToStr";
import { productMachine } from "@/machines/productMachine";
import { Product } from "@/types/productTypes";
import { useSelector } from "@xstate/react";
import { useCallback, useMemo } from "react";
import { useAppContext } from "./useAppContext";
import { useToast } from "./useToast";
import { useState } from "react";

export enum ContextState {
    Idle,
    FetchingContexts,
    DisplayingContextsTable,
    DisplayingAddContextForm,
    DisplayingContextDetailModal
  }
  
  export const useContextContext = () => {
    const { actorRef } = useAppContext();
    const contextActorRef = actorRef.context;
    // Similar state management to useProductContext
    const [state, setState] = useState({ contextState: ContextState.Idle });
    const [data, setData] = useState({ contexts: [], currentPage: 0, totalContexts: 0 });
  
    // Add your actions here similar to ProductComponent
    const actions = {
      submit: {
        applyFilter: (filters: Record<string, string>) => {
          // Implement filter logic
        }
      },
      click: {
        nextPage: () => {},
        previousPage: () => {},
        selectContext: (context: any) => {},
        addContext: () => {}
      }
    };
  
    // return { state, data, actions };
    return {
      state: {
        contextState: state.contextState,
      },
      data: {
        contexts: useSelector(contextActorRef, (state) => state.context.contexts),
        // Other data...
      },
      actions: {
        fetch: {
          contexts: () => contextActorRef.send({ type: "app.startManagingContexts" }),
        },
        // Other existing actions...
      }
    };
  };
  // };