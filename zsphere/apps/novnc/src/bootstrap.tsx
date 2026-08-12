import React from "react";
import ReactDOM from "react-dom/client";

import App from "./pages";

import "./global.less";
import "./theme.less";

const container = document.getElementById("root");

if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
