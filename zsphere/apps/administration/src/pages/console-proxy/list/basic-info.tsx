import { gql } from "@apollo/client";
import { Auth } from "@zstack/auth";
import { Tooltip } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { Icon } from "@zstack/icon";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List, Constant } from "@zstack/zsphere-components";
import type { ConstantEnum } from "@zstack/zsphere-constant";
import { useAction } from "@zstack/zsphere-hooks";
import type { ConsoleProxyAgent } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import UpdateConsoleProxyAgentModal from "../action/update";

import style from "./style.module.less";

const reconnectConsoleProxy = gql`
  mutation reconnectConsoleProxy($input: ReconnectConsoleProxyInput!) {
    reconnectConsoleProxy(input: $input) {
      actionId
    }
  }
`;

export interface IProps {
  detail: ConsoleProxyAgent;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  refetch?: Function;
}

const BasicInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed,
}) => {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const doAction = useAction();
  const [updateConsoleProxyVisible, setUpdateConsoleProxyVisible] =
    React.useState<boolean>(false);

  const reconnect = () => {
    doAction({
      mutation: reconnectConsoleProxy,
      payload: {
        agentUuids: [detail?.uuid],
      },
      name: intl.formatMessage({
        id: "consoleproxy.action.reconnect",
        defaultMessage: "Reconnect Console Proxy",
      }),
      total: 1,
    });
  };

  const list = React.useMemo<Array<ListItem>>(
    () => [
      {
        label: intl.formatMessage({
          id: "virtualization.console.proxy.status",
          defaultMessage: "Status",
        }),
        value: <Constant value={detail?.status as ConstantEnum} />,
      },
      {
        label: intl.formatMessage({
          id: "virtualization.console.proxy.field.consoleProxyOverriddenIp",
          defaultMessage: "Console Proxy Address",
        }),
        value: detail?.consoleProxyOverriddenIp,
      },
      {
        label: intl.formatMessage({
          id: "type",
          defaultMessage: "Type",
        }),
        value: detail?.type,
      },
      {
        label: intl.formatMessage({
          id: "port",
          defaultMessage: "Port",
        }),
        value: detail?.consoleProxyPort,
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(detail?.createDate).format("YYYY-MM-DD HH:mm:ss"),
      },
    ],
    [intl, detail],
  );

  const extraInfo = React.useMemo(() => {
    return (
      <div className="flex items-center gap-2">
        <Auth
          authKey={{
            type: "action",
            authKey: "reconnect.consoleproxy",
            resource: "console.proxy",
          }}
        >
          <Tooltip
            title={intl.formatMessage({
              id: "virtualization.console.proxy.action.re.connect",
              defaultMessage: "Reconnect",
            })}
          >
            <Icon
              type="swap"
              onClick={(e) => {
                e.stopPropagation();
                reconnect();
              }}
              className={style["card-extra-btn"]}
            />
          </Tooltip>
        </Auth>

        <Auth
          authKey={{
            type: "action",
            authKey: "update.consoleproxy",
            resource: "console.proxy",
          }}
        >
          <Tooltip
            title={intl.formatMessage({
              id: "virtualization.console.proxy.action.modify.proxy",
              defaultMessage: "Modify Proxy Address",
            })}
          >
            <Icon
              type="edit"
              onClick={(e) => {
                e.stopPropagation();
                setUpdateConsoleProxyVisible(true);
              }}
              className={style["card-extra-btn"]}
            />
          </Tooltip>
        </Auth>
      </div>
    );
  }, [intl]);

  const memoizedSelectedList = useMemo<[ConsoleProxyAgent]>(
    () => [detail],
    [detail],
  );

  return (
    <>
      <DraggableCard
        title={detail?.managementIp}
        extra={extraInfo}
        isList
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
      >
        <List list={list} bordered={false} />
      </DraggableCard>

      <UpdateConsoleProxyAgentModal
        title={intl.formatMessage({
          id: "virtualization.console.proxy.action.modify.proxy",
          defaultMessage: "Modify Proxy Address",
        })}
        visible={updateConsoleProxyVisible}
        setVisible={setUpdateConsoleProxyVisible}
        selectedList={memoizedSelectedList}
      />
    </>
  );
};

export default BasicInfo;
