import type { BasicEndPoint as IBasicEndPoint } from "@zstack/zsphere-types/graphql";
import React from "react";

import List from "./list/index";

interface IProps {
  currentEndpoint: IBasicEndPoint;
}

const EndPointSmsAddress: React.FC<IProps> = ({ currentEndpoint }) => {
  return (
    <div className="main-list">
      <List
        className="main-list-panel"
        currentEndpoint={currentEndpoint}
        view="main"
      />
    </div>
  );
};

export default EndPointSmsAddress;
