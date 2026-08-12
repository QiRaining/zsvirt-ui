import type { ListItem } from "@zstack/zsphere-components";
import { List, DraggableCard } from "@zstack/zsphere-components";
import type { SnmpAgent } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { VersionType } from "../../create/basic-config";

interface IProps {
  current: SnmpAgent;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  refetch?: Function;
}

const BasicInfo: React.FC<IProps> = ({
  current,
  onCollapseChange,
  collapsed,
}) => {
  const intl = useIntl();

  const isOpenOrClosed = React.useCallback(
    (value) => {
      return String(value) === "true"
        ? intl.formatMessage({
            id: "open",
            defaultMessage: "Enabled",
          })
        : intl.formatMessage({
            id: "closed",
            defaultMessage: "Disabled",
          });
    },
    [intl],
  );

  const list = React.useMemo<Array<ListItem>>(() => {
    const basicInfoList = [
      {
        label: intl.formatMessage({
          id: "snmp.agent.port",
          defaultMessage: "SNMP Agent Port",
        }),
        value: current.port,
      },
      {
        label: intl.formatMessage({
          id: "snmp.agent.version",
          defaultMessage: "Protocol Version",
        }),
        value: current.version,
      },
    ];

    let extraInfoList: Array<ListItem> = [];

    if (current.version === VersionType.v2c) {
      extraInfoList = [
        {
          label: intl.formatMessage({
            id: "snmp.agent.readCommunity",
            defaultMessage: "Community String",
          }),
          value: current.readCommunity,
        },
      ];
    }

    if (current.version === VersionType.v3) {
      extraInfoList = [
        {
          label: intl.formatMessage({
            id: "username",
            defaultMessage: "Username",
          }),
          value: current.userName,
        },
        {
          label: intl.formatMessage({
            id: "user.authentication",
            defaultMessage: "User Authentication",
          }),
          value: isOpenOrClosed(!!current.authAlgorithm),
        },
        {
          label: intl.formatMessage({
            id: "authentication.protocol",
            defaultMessage: "Protocol",
          }),
          value: current.authAlgorithm,
        },
        {
          label: intl.formatMessage({
            id: "data.encryption",
            defaultMessage: "Data Encryption",
          }),
          value: isOpenOrClosed(!!current.privacyAlgorithm),
        },
        {
          label: intl.formatMessage({
            id: "encryption.protocol",
            defaultMessage: "Protocol",
          }),
          value: current.privacyAlgorithm,
        },
      ];
    }

    return [...basicInfoList, ...extraInfoList];
  }, [intl, current, isOpenOrClosed]);

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
        isList
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
      >
        <List list={list} bordered={false} />
      </DraggableCard>
    </>
  );
};

export default BasicInfo;
