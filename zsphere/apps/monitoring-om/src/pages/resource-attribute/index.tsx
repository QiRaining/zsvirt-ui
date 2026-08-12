import React from "react";

import Header from "./header";
import List from "./key/list";

export default () => {
  return (
    <div className="main-list-header-tabs-container">
      <Header />
      <div className="zsv-list-padding">
        <List view="main" />
      </div>
    </div>
  );
};
