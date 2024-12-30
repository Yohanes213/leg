"use client";

import { appMachine } from "@/machines/appMachine";
import { createContext } from "react";
import { ActorRefFrom, createActor } from "xstate";

const appActor = createActor(appMachine).start();

export const AppContext = createContext<ActorRefFrom<typeof appMachine> | null>(null);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  return <AppContext.Provider value={appActor}>{children}</AppContext.Provider>;
};
