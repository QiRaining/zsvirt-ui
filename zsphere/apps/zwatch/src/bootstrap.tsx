import React from "react";
import ReactDOM from "react-dom/client";

// 导入样式文件，确保 business-component 和 design 组件库的样式正确加载
import "@zstack/zsphere-components/dist/style/index.less";
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
