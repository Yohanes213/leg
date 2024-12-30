"use client";

import { useToast } from "@/hooks/useToast";
import { convertStateToString } from "@/lib/stateToStr";
import { Architecture, HistoryManagement, Model } from "@/types";
import { useSelector } from "@xstate/react";
import { useCallback, useContext, useEffect, useMemo } from "react";
import { AppContext } from "../context/appContext";

export enum AppState {
  Testing = "Testing",
  Managing = "Managing",
  ContextFetch = "ContextFetch",
  Chatting = "Chatting",
  Importing = "Importing",
  Exporting = "Exporting",
  Updating = "Updating",
}
const stateMap: Record<string, AppState> = {
  "open.testing": AppState.Testing,
  "open.managingProducts": AppState.Managing,
  "open.selectContext": AppState.ContextFetch,
  "open.chatting": AppState.Chatting,
  "importingState.displayingImportStateForm": AppState.Importing,
  "importingState.importingState": AppState.Importing,
  "exportingState.displayingExportStateForm": AppState.Exporting,
  "exportingState.exportingState": AppState.Exporting,
  "updatingSettings.displayingUpdateSettingForm": AppState.Updating,
  "updatingSettings.updatingSettings": AppState.Updating,
};

type AppActions =
  | { type: "user.selectTest" }
  | { type: "user.selectManageProducts" }
  | { type: "user.selectContextViews" }
  | { type: "user.selectChat" }
  | { type: "user.selectUser"; user: string } 
  | { type: "user.importState" }
  | { type: "user.exportState" }
  | { type: "user.updateSetting" }
  | { type: "user.submitImportStateForm"; file: File }
  | { type: "user.submitExportStateForm"; fileName: string }
  | {
      type: "user.submitUpdateSettingForm";
      model: Model;
      architecture: Architecture;
      historyManagement: HistoryManagement;
    }
  | { type: "user.submitResetSettings" }
  | { type: "user.cancelImportState" }
  | { type: "user.cancelExportState" }
  | { type: "user.cancelUpdateSetting" };

export const useAppContext = () => {
  const appActorRef = useContext(AppContext);
  if (!appActorRef) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  const state = useSelector(appActorRef, (state) => state);
  useToast(appActorRef);

  const appState = useMemo(() => {
    console.log("App state")
    console.log(state)
    const currentState = convertStateToString(state.value);
    console.log(stateMap[currentState])
    console.log(AppState.Testing)
    return stateMap[currentState] || AppState.Testing;
  }, [state]);

  const appDispatch = useCallback(
    (action: AppActions) => {
      appActorRef.send(action);
    },
    [appActorRef]
  );

  useEffect(() => {
    const saveInterval = setInterval(() => {
      appActorRef.send({ type: "sys.saveState" });
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [appActorRef]);
  console.log("$$$$$$$$$$$$$$$$$$$ context")
  console.log(state.context)
  return {
    actorRef: {
      chat: state.context.chatRef,
      test: state.context.testRef,
      product: state.context.prodRef,
      context: state.context.conRef,
    },
    state: {
      appState,
      selectedUser: state.context.selectedUser,
    },
    data: {
      model: useSelector(appActorRef, (state) => state.context.model),
      architecture: useSelector(appActorRef, (state) => state.context.architecture),
      historyManagement: useSelector(appActorRef, (state) => state.context.historyManagement),
    },
    actions: {
      select: {
        test: () => appDispatch({ type: "user.selectTest" }),
        manageProducts: () => appDispatch({ type: "user.selectManageProducts" }),
        contextViews: () => appDispatch({ type: "user.selectContextViews" }),
        chat: () => appDispatch({ type: "user.selectChat" }),
        importState: () => appDispatch({ type: "user.importState" }),
        exportState: () => appDispatch({ type: "user.exportState" }),
        updateSetting: () => appDispatch({ type: "user.updateSetting" }),
        user: (user: string) => appDispatch({ type: "user.selectUser", user }), 
      },
      submit: {
        importState: (file: File) => appDispatch({ type: "user.submitImportStateForm", file }),
        exportState: (fileName: string) => appDispatch({ type: "user.submitExportStateForm", fileName }),
        updateSetting: (model: Model, architecture: Architecture, historyManagement: HistoryManagement) =>
          appDispatch({ type: "user.submitUpdateSettingForm", model, architecture, historyManagement }),
        resetSettings: () => appDispatch({ type: "user.submitResetSettings" }),
      },
      cancel: {
        importState: () => appDispatch({ type: "user.cancelImportState" }),
        exportState: () => appDispatch({ type: "user.cancelExportState" }),
        updateSetting: () => appDispatch({ type: "user.cancelUpdateSetting" }),
      },
    },
  };
};

export type AppContextData = ReturnType<typeof useAppContext>["data"];
export type AppContextActions = ReturnType<typeof useAppContext>["actions"];
