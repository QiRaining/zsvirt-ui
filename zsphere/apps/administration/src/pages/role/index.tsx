import { ZsvRoleQueryType } from "@zstack/zsphere-types";
import React from "react";

import Header from "./header";
import RoleList from "./list";

import style from "./style.module.less";

export default () => {
  return (
    <div className="main-list-header-tabs-container">
      <Header />
      <div className={style.main}>
        <RoleList
          view="virtualization.main"
          defaultQuery={{
            type: ZsvRoleQueryType.GET_ROLE_FOR_MANAGEMENT,
          }}
        />
      </div>
    </div>
  );
};
