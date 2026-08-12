import { useLazyQuery } from "@apollo/client";
import type { IDetailDrawerProps } from "@zstack/zsphere-components";
import { Detail as ZSVDetail } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { EmailServerSetting as IEmailServerSetting } from "@zstack/zsphere-types/graphql";
import { useControllableValue } from "ahooks";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { emailServerSettingList } from "../../../gql/email-server-setting.gql";
import useActionConfig from "../config/useActionConfig";
import { EmailServerContext } from "../hook";
import AuditList from "./audit/index";
import Overview from "./overview/index";

export interface IProps {
  view?: string;
}

const Detail: React.FC<IProps> = ({
  view = "main.virtualization",
  ...props
}) => {
  const intl = useIntl();

  const [visible, setVisible] = useControllableValue(props, {
    defaultValue: false,
    valuePropName: "visible",
    trigger: "setVisible",
  });

  const { store, setStore } = React.useContext(EmailServerContext);

  const [query, { data, loading: _loading, refetch }] = useLazyQuery<{
    emailServerSettingList: { list: IEmailServerSetting[]; total: number };
  }>(emailServerSettingList);

  const actionConfig = useActionConfig();

  const current = useMemo(() => {
    return (
      data?.emailServerSettingList.list.filter(
        (list: { uuid: string }) => list.uuid === store.emailServer?.uuid,
      )[0] || {}
    );
  }, [data, store]);

  React.useEffect(() => {
    if (store.emailServer) {
      setVisible(true);
    }
  }, [store]);

  React.useEffect(() => {
    if (visible) {
      query({
        variables: {
          uuid: store.emailServer?.uuid,
        },
      });
    }
  }, [visible, store]);
  useActionSubscribe({
    resourceTypeList: ["EmailServerSetting"],
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
          view,
          position: "header",
          menuList: actionConfig.list,
          viewMap: actionConfig.viewMap,
          selectedList: [current],
          refetch,
        },
      },
      {
        key: "auditing",
        tab: intl.formatMessage({ id: "audit", defaultMessage: "Event" }),
        children: <AuditList current={current} />,
      },
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
      getContainer={`#${view.split(".").join("-")}`}
      onClose={() => {
        setStore({
          ...store,
          emailServer: undefined,
        });
      }}
    />
  );
};

export default Detail;
