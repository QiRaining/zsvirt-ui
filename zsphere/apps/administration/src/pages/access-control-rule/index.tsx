import React from "react";

import Header from "./header";
import List from "./list";

export default () => {
  return (
    <div className="main-list-header-tabs-container">
      <Header />
      <div className="zsv-list-padding">
        <List view="main.virtualization" />
      </div>
    </div>
  );
};
