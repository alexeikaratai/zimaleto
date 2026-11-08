import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./base.css";
import "./fields/fields.css";
import "./controls/controls.css";
import "./stage/stage.css";

const rootElement = document.getElementById("root");

if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <App />
        </StrictMode>,
    );
}
