import type { ListItem } from "@zstack/zsphere-components";
import { List, DraggableCard } from "@zstack/zsphere-components";
import type {
  AccountThirdPartyAuth as IAccountThirdPartyAuth,
  ThirdPartyAuthVO as IThirdPartyAuthVO,
} from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import EditOidcConfig from "../../action/edit-config";
import UpdateConfigModal from "../../action/update-config";
import { getSsoType } from "../../uitls";

interface IProps {
  current: Partial<IAccountThirdPartyAuth & IThirdPartyAuthVO>;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  refetch?: any;
}

const ConfigInfo: FC<IProps> = ({
  current,
  onCollapseChange,
  collapsed,
  refetch,
}) => {
  const intl = useIntl();
  const memoizedSelectedList = useMemo(
    () => [current as IAccountThirdPartyAuth],
    [current],
  );
  const memoizedSelectedListCast = useMemo(
    () => [current as IAccountThirdPartyAuth],
    [current],
  );

  const [updateConfigModalVisible, setUpdateConfigModalVisible] =
    React.useState<boolean>(false);
  const [editConfigVisible, setEditConfigVisible] =
    React.useState<boolean>(false);

  const { isLdapServer, isOIDC } = getSsoType(current);

  const list: ListItem[] = useMemo(() => {
    if (isOIDC) {
      return [
        {
          label: intl.formatMessage({
            id: "account.third.party.login.address",
            defaultMessage: " Password-free Login URL",
          }),
          value: current.loginMNUrl,
          copyable: true,
        },
        {
          label: intl.formatMessage({
            id: "sso.client.id",
            defaultMessage: "Client ID",
          }),
          value: current.clientId,
          copyable: true,
        },
        {
          label: intl.formatMessage({
            id: "sso.authorizationUrl",
            defaultMessage: "Authorization Request URL",
          }),
          value: current.authorizationUrl,
          copyable: true,
        },
        {
          label: intl.formatMessage({
            id: "sso.tokenUrl",
            defaultMessage: "Token Request URL",
          }),
          value: current.tokenUrl,
          copyable: true,
        },
      ];
    }

    if (isLdapServer) {
      return [
        {
          label: intl.formatMessage({ id: "baseDn", defaultMessage: "Base DN" }),
          value: current?.base,
          copyable: true,
        },
        {
          label: intl.formatMessage({ id: "userDn", defaultMessage: "User DN" }),
          value: current?.username,
          copyable: true,
        },

        {
          label: intl.formatMessage({
            id: "filteringRules",
            defaultMessage: "Filter Rule",
          }),
          value: current.filter,
        },
        {
          label: intl.formatMessage({
            id: "loginProperties",
            defaultMessage: "Login Attribute",
          }),
          value: current?.usernameProperty,
        },
      ];
    }

    return [];
  }, [intl, current, isLdapServer, isOIDC]);

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "configInfo",
          defaultMessage: "Configurations",
        })}
        isList
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
        titleActions={[
          ...(isOIDC
            ? [
                {
                  icon: "edit" as const,
                  onClick: () => setEditConfigVisible(true),
                  tooltip: intl.formatMessage({
                    id: "edit.config.info",
                    defaultMessage: "Modify Configuration",
                  }),
                  authKey: "virtualization.edit.config",
                  resource: "account.third.party.auth",
                },
              ]
            : []),
          ...(isLdapServer
            ? [
                {
                  icon: "edit" as const,
                  onClick: () => setUpdateConfigModalVisible(true),
                  tooltip: intl.formatMessage({
                    id: "edit.config.info",
                    defaultMessage: "Modify Configuration",
                  }),
                  authKey: "virtualization.edit.info",
                  resource: "account.third.party.auth",
                },
              ]
            : []),
        ]}
      >
        <List list={list} bordered={false} />
      </DraggableCard>

      <UpdateConfigModal
        visible={updateConfigModalVisible}
        setVisible={setUpdateConfigModalVisible}
        selectedList={memoizedSelectedList}
        view="main"
        position="header"
      />

      <EditOidcConfig
        visible={editConfigVisible}
        setVisible={setEditConfigVisible}
        selectedList={memoizedSelectedListCast}
        view="main"
        position="header"
        refetch={refetch}
      />
    </>
  );
};

export default ConfigInfo;
