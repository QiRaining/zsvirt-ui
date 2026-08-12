import type { IListProps } from "@zstack/zsphere-types";
import type { EmailServerSetting as IEmailServerSetting } from "@zstack/zsphere-types/graphql";
import React from "react";

import Detail from "./detail";
import { EmailServerContext } from "./hook";
import EmailTableList from "./list/index";

import style from "./style.module.less";

const EmailServerSettingList: React.FC<IListProps<IEmailServerSetting>> = ({
  view,
  defaultQuery = {},
  selectType = "checkbox",
  columnKeys = [],
  ...props
}) => {
  const { store, setStore } = React.useContext(EmailServerContext);

  const getRowClassName = React.useCallback(
    (record: IEmailServerSetting) => {
      return record.uuid === store?.emailServer?.uuid ? "active-row" : "";
    },
    [store?.emailServer],
  );

  return (
    <div className={style["list-container"]}>
      <div
        className={style["email-server-body"]}
        id={`${view.split(".").join("-")}`}
      >
        <div className={style.main}>
          <EmailTableList
            tableProps={{
              rowClassName: getRowClassName,
            }}
            view={view}
            defaultQuery={defaultQuery}
            selectType={selectType}
            columnKeys={columnKeys}
            onClickName={(item: IEmailServerSetting) => {
              setStore({
                ...store,
                emailServer: item,
              });
            }}
            {...props}
          />
        </div>
        {store?.emailServer?.uuid ? <Detail view={view} /> : null}
      </div>
    </div>
  );
};

export default EmailServerSettingList;
