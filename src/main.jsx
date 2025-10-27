import React from "react";
import { createRoot } from "react-dom/client";
import App from './App.jsx';
import Control from "./Control";
import "./styles.css";
const root = createRoot(document.getElementById("root"));
const path = window.location.pathname;
root.render(path.startsWith("/control") ? <Control /> : <App />);
