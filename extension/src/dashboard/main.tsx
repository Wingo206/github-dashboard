import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { DashboardController } from "./controllers";
import { DashboardProvider } from "./context/DashboardContext";
import "./index.css";

const controller = new DashboardController();
controller.init();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DashboardProvider controller={controller}>
      <App />
    </DashboardProvider>
  </StrictMode>,
);
