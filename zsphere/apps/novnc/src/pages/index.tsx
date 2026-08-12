import { ConfigProvider } from "@zstack/zsphere-components";
import React from "react";

import App from "./novnc";
import { VNCAction } from "./vnc-action";

interface IProps {}

const Index: React.FC<IProps> = () => {
  return (
    <ConfigProvider version="zsv">
      <App />
      <VNCAction />
    </ConfigProvider>
  );
};

export default Index;
