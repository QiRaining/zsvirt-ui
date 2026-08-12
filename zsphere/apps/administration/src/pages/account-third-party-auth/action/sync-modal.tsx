import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { ThirdPartyAuthVO as IThirdPartyAuth } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { syncAccountsFromLdapServer } from "../../../gql/account-third-party-auth.gql";

const Action: React.FC<IActionWrapperProps<IThirdPartyAuth>> = ({
  visible,
  setVisible,
  selectedList = [],
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    doAction({
      mutation: syncAccountsFromLdapServer,
      payload: {
        uuid: selectedList?.[0]?.uuid,
      },
      name: intl.formatMessage({
        id: "sync.3rdPartyAuthServer",
        defaultMessage: "Synchronize SSO Server",
      }),
      total: 1,
    });
  };

  return (
    <DialogP1
      title={intl.formatMessage({
        id: "thirdPartyAuth.modal.title.confirm.sync.3rdPartyAuthServer",
        defaultMessage: "Synchronize SSO Server?",
      })}
      visible={visible}
      setVisible={setVisible}
      bannerMessage={intl.formatMessage({
        id: "3rdPartyAuthentication.modal.sync.alert.danger",
        defaultMessage: `1. Synchronizing the SSO server will reacquire the latest user list.
2. After synchronization, the non-existent users will be placed into "Deleted" state and cannot be used for login.`,
      })}
      resourceType={intl.formatMessage({
        id: "3rdPartyAuthServer",
        defaultMessage: "SSO Server",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={onOk}
    />
  );
};

export default Action;
