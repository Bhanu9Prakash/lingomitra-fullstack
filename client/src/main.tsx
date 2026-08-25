import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./theme-harmony.css";
import { registerServiceWorker } from "./pwa-config";

registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
