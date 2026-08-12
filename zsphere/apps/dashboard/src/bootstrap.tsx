import React from "react";
import ReactDOM from "react-dom/client";

// boneyard 骨架屏的全局配置已内置在 AutoSkeleton 组件中，无需在此手动调用
//import "@zstack/design/dist/style.css";
import App from "./App";

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
