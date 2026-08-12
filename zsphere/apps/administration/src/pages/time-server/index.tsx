import type { FC } from "react";
import React from "react";

import Header from "./header";
import PanelAction from "./panel-action";
import PanelServers from "./panel-servers";
import PanelTime from "./panel-time";

import style from "./style.module.less";

const TimeServer: FC = () => {
  return (
    <div>
      <Header />
      <div className={style.container}>
        <div className={style.content}>
          <PanelAction />
          <PanelTime />
          <PanelServers />
        </div>
      </div>
    </div>
  );
};

export default TimeServer;
