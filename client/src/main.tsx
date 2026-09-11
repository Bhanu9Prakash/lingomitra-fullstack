import { createRoot } from "react-dom/client";
import App from "./App";
import { MotionConfig } from 'motion/react';
import "./index.css";
import "./theme-harmony.css";
import "./taste-refresh.css";
import "./learning-workspace.css";
import "./approved-visuals.css";
import { registerServiceWorker } from "./pwa-config";

registerServiceWorker();

createRoot(document.getElementById("root")!).render(<MotionConfig reducedMotion="user"><App /></MotionConfig>);
