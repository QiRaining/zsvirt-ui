import { gql } from "@apollo/client";
import { DialogP0 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { GlobalConfigQueryType } from "@zstack/zsphere-types";
import type { ResetGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { globalConfigList } from "../../../gql/global-config.gql";

const _resetGlobalConfig = gql`
  mutation resetGlobalConfig($input: ResetGlobalConfigInput!) {
    resetGlobalConfig(input: $input) {
      actionId
    }
  }
`;

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  view?: string;
  refetch?: Function;
}

const ResetGlobalConfig: React.FC<IProps> = ({
  visible,
  setVisible,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = () => {
    const payload: ResetGlobalConfigPayload = {};
    doAction({
      mutation: _resetGlobalConfig,
      payload,
      name: intl.formatMessage({
        id: "virtualization.reset.global.config",
        defaultMessage: "Reset to Default Settings",
      }),
      type: "GlobalConfig",
      total: 1,
      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      forceRunCallback: true,
      onFinish: (_result: IActionResult) => {
        setVisible(false);
        refetch?.();
      },
    });
  };

  const confirmWord = "Restore";

  return (
    <DialogP0
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "virtualization.reset.global.config.title",
        defaultMessage: "Reset to Default Settings?",
      })}
      bannerMessage={intl.formatMessage({
        id: "virtualization.reset.global.config.warning",
        defaultMessage:
          "This operation will reset all basic, advanced global settings, and the advanced settings in HA Policy to the initial default settings. Procced with caution.",
      })}
      resourceNames={[]}
      guide={{
        confirmWord,
        guideMessage: (
          <>
            {intl.formatMessage(
              {
                id: "virtualization.reset.global.config.confirm.guide",
                defaultMessage:
                  'Input "{confirmWord}" to confirm the recovery confirmation.',
              },
              {
                confirmWord: (
                  <span className="text-danger-600 font-bold">
                    {confirmWord}
                  </span>
                ),
              },
            )}
          </>
        ),
      }}
      confirmText={intl.formatMessage({
        id: "virtualization.reset.global.config.confirm",
        defaultMessage: "Confirm Recovery",
      })}
      onConfirm={onOk}
    />
  );
};

export default ResetGlobalConfig;
