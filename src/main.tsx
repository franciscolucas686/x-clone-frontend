import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "@/ui/ErrorBoundary";
import App from "@/App.tsx";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Fora do App para cobrir também uma falha na montagem do Provider. */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
