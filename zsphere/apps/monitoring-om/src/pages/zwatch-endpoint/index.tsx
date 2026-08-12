import React from "react";

import Header from "./header";
import List from "./list";

import style from "./style.module.less";

const EndPoint: React.FC = () => {
  return (
    <div className="main-list-header-tabs-container main-list">
      <Header />
      <List className={style.container} view="main.virtualization" />
    </div>
  );
};

export default EndPoint;
