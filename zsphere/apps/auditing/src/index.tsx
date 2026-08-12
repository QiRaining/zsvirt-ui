import React from "react";

import Header from "./header";
import List from "./list";

import style from "./style.module.less";

const Auditing: React.FC = () => {
  return (
    <div className="main-list-header-tabs-container main-list">
      <Header />
      <List view="main.resource" className={style.main} />
    </div>
  );
};

export default Auditing;
