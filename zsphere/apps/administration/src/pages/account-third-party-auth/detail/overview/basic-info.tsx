import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import { List, DraggableCard } from "@zstack/zsphere-components";
import { LdapServerType } from "@zstack/zsphere-types";
import type {
  AccountThirdPartyAuth as IAccountThirdPartyAuth,
  ThirdPartyAuthVO as IThirdPartyAuthVO,
} from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { getSsoType } from "../../uitls";

interface IProps {
  current: Partial<IAccountThirdPartyAuth & IThirdPartyAuthVO>;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  refetch?: Function;
}

const BasicInfo: FC<IProps> = ({ current, onCollapseChange, collapsed }) => {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const { isOIDC } = getSsoType(current);

  const thirdPartyAuthType = useMemo(() => {
    if (isOIDC) {
      return "OIDC";
    }
    return current?.serverType === LdapServerType.WindowsAD ? "AD" : "LDAP";
  }, [isOIDC, current]);

  const list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "name",
          defaultMessage: "Name",
        }),
        value: current.name,
      },
      {
        label: intl.formatMessage({
          id: "type",
          defaultMessage: "Type",
        }),
        value: thirdPartyAuthType,
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: current.description ? current.description : undefined,
      },
      {
        label: "UUID",
        value: current.uuid,
        copyable: true,
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(current.createDate!).format("YYYY-MM-DD HH:mm:ss"),
        key: "createDate",
      },
    ],
    [intl, getServerTime, current, thirdPartyAuthType],
  );

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
