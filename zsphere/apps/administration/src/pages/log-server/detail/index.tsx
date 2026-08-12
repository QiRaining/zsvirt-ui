import { useQuery } from "@apollo/client";
import type { IDetailDrawerProps } from "@zstack/zsphere-components";
import { Detail as ZSVDetail } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { LogServer as ILogServer } from "@zstack/zsphere-types/graphql";
import { useControllableValue } from "ahooks";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { logServerList } from "../../../gql/log-server.gql";
import { useActionConfig } from "../config";
import { LogServerContext } from "../hook";
import Overview from "./overview/index";

import style from "../style.module.less";

export interface IProps {}

const Detail: React.FC<IProps> = ({ ...props }) => {
  const intl = useIntl() as any;

  const [visible, setVisible] = useControllableValue(props, {
    defaultValue: false,
    valuePropName: "visible",
    trigger: "setVisible",
  });

  const { store, setStore } = React.useContext(LogServerContext);
  const actionConfig = useActionConfig();

  const { data, refetch } = useQuery<{
    logServerList: { list: ILogServer[]; total: number };
  }>(logServerList, {
    variables: { start: 0, limit: 9999 },
    skip: !visible || !store.logServer?.uuid,
  });

  const current =
    data?.logServerList?.list?.filter(
      (list: { uuid: string }) => list.uuid === store.logServer?.uuid,
    )[0] || {};
  React.useEffect(() => {
    if (store.logServer) {
      setVisible(true);
    }
  }, [store]);

  useActionSubscribe({
    resourceTypeList: ["LogServer"],
    onProgress: () => {
      refetch?.();
    },
  });

  const tabTabPanes = useMemo<IDetailDrawerProps["tabTabPanes"]>(
    () => [
      {
        key: "substract",
        tab: intl.formatMessage({ id: "overview", defaultMessage: "Overview" }),
        children: <Overview current={current} />,
        action: {
          view: "main.virtualization",
          position: "header",
          menuList: actionConfig.list,
          viewMap: actionConfig.viewMap,
          selectedList: [current],
          refetch,
        },
      },
      {},
    ],
    [current, intl],
  );

  if (!visible) {
    return null;
  }
  return (
    <ZSVDetail.Drawer
      visible={visible}
      setVisible={setVisible}
      tabTabPanes={tabTabPanes}
      getContainer="#log-server-body"
      className={style["detail-drawer"]}
      maskClosable={false}
      onClose={() => {
        setStore({
          ...store,
          logServer: undefined,
        });
      }}
    />
  );
};

export default Detail;
