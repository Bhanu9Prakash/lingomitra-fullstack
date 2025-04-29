import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker } from "./pwa-config";

// Register the service worker for PWA support
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
