import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/public.css";
import "./styles/theme.css";
import App from "./App";
import { initTheme } from "./hooks/useTheme";

initTheme();

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
