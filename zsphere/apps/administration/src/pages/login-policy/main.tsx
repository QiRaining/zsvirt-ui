import { gql } from "@apollo/client";
import { useAuth } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { UpdateGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { LoginPolicyConfig, VmConfig, HostConfig } from "./setting";

import style from "./style.module.less";

const updateGlobalConfig = gql`
  mutation updateGlobalConfig($input: UpdateGlobalConfigInput!) {
    updateGlobalConfig(input: $input) {
      actionId
    }
  }
`;

export interface IProps {}

const Main: React.FC<IProps> = () => {
  const intl = useIntl();
  const doAction = useAction();
  const { hasAuth } = useAuth();
  const canEdit = hasAuth({
    type: "action",
    authKey: "edit",
    resource: "security.setting",
  });

  const onOk = (
    payloadList: UpdateGlobalConfigPayload[],
    configName?: string,
  ) => {
    const payload: UpdateGlobalConfigPayload[] = payloadList;
    doAction({
      mutation: updateGlobalConfig,
      payload,
      name: intl.formatMessage(
        {
          id: "update.security.config",
          defaultMessage: "Modify Configuartion: {name}",
        },
        {
          name: configName,
        },
      ),
      total: payload?.length || 1,
    });
  };

  return (
    <div className={style.main}>
      <LoginPolicyConfig ok={onOk} readOnly={!canEdit} />

      <VmConfig ok={onOk} readOnly={!canEdit} />

      <HostConfig ok={onOk} readOnly={!canEdit} />
    </div>
  );
};

export default Main;
