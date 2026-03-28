import { createContext, useContext, type ReactNode } from "react";
import type { DashboardController } from "../controllers";

const DashboardContext = createContext<DashboardController | null>(null);

export function DashboardProvider({
  controller,
  children,
}: {
  controller: DashboardController;
  children: ReactNode;
}) {
  return (
    <DashboardContext.Provider value={controller}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardController {
  const controller = useContext(DashboardContext);
  if (!controller) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return controller;
}
