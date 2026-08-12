import React from "react";

import Header from "./header";
import List from "./list";

import style from "./style.module.less";

export default () => {
  return (
    <div className="main-list-header-tabs-container">
      <Header />
      <div className={style.main}>
        <List />
      </div>
    </div>
  );
};
