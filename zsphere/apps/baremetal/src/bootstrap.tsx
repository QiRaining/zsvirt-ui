import React from "react";
import ReactDOM from "react-dom/client";

import "@zstack/zsphere-components/dist/style/index.less";

const App = () => <div>Baremetal App</div>;

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
