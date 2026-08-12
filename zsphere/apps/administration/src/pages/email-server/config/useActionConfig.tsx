import { useActionConfig } from "@zstack/zsphere-engine/src/email-server";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import { SNSApplicationPlatformState } from "@zstack/zsphere-types";
import type {
  EmailServerSetting as IEmailServerSetting,
  ValidateSNSEmailPlatformPayload,
} from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";
import SetShareTypeFromNoGroup from "zsv_administration_shared/account-information/action/set-share-type-from-noGroup";

import {
  disableEmailServerSettings,
  enableEmailServerSettings,
  validateSNSEmailServer,
} from "../../../gql/email-server-setting.gql";
import {
  verifyDisableEmailServerSetting,
  verifyEnableEmailServerSetting,
  verifyMulti,
  verifySingle,
} from "../action/validator";

export default () => {
  const intl = useIntl();
  const doAction = useAction();

  return useActionConfig<IEmailServerSetting>([
    {
      key: "create.emailServerSetting",
      primary: true,
      autoInjectPreValidator: false,
      ActionWrapper: require("../action/add-modal").default,
    },
    {
      key: "stop",
      onClick: ({ selectedList, setSelectedList }) => {
        doAction({
          mutation: disableEmailServerSettings,
          payload: selectedList.map((item) => {
            return { uuid: item.uuid };
          }),
          name: intl.formatMessage({
            id: "stop.emailServer",
            defaultMessage: "Disable Email Server",
          }),
          type: "EmailServerSetting",
          total: selectedList.filter(
            (ems) => ems.state !== SNSApplicationPlatformState.Disabled,
          ).length,
          onFinish: () => {
            setSelectedList?.([]);
          },
        });
      },
      preValidators: [],
      validators: [verifyDisableEmailServerSetting],
      icon: "stop-circle-fill",
      iconStyle: {
        color: "#F4454C",
      },
    },
    {
      key: "start",
      preValidators: [],
      validators: [verifyEnableEmailServerSetting],
      onClick: ({ selectedList, setSelectedList }) => {
        doAction({
          mutation: enableEmailServerSettings,
          payload: selectedList.map((item) => {
            return { uuid: item.uuid };
          }),
          name: intl.formatMessage({
            id: "start.emailServer",
            defaultMessage: "Enable Email Server",
          }),
          type: "EmailServerSetting",
          total: selectedList.filter(
            (ems) => ems.state !== SNSApplicationPlatformState.Enabled,
          ).length,
          onFinish: () => {
            setSelectedList?.([]);
          },
        });
      },
      icon: "play-circle-fill",
      iconStyle: {
        color: "#5ACA49",
      },
    },
    {
      key: "changeOwner",
      ActionWrapper: require("../action/change-owner").default,
    },
    {
      key: "validate",
      name: intl.formatMessage({
        id: "test.connection",
        defaultMessage: "Test Connection",
      }),
      onClick: ({ selectedList, setSelectedList }) => {
        const payload: ValidateSNSEmailPlatformPayload[] = selectedList.map(
          ({ uuid }) => ({
            uuid,
          }),
        );
        doAction({
          mutation: validateSNSEmailServer,
          payload,
          name: intl.formatMessage({
            id: "test.emailServer",
            defaultMessage: "Test Email Server",
          }),
          total: selectedList.length,
          onProgress: (_result: ITaskResult) => {},
          onFinish: (_result: IActionResult) => {
            setSelectedList?.([]);
          },
        });
      },
    },
    {
      key: "edit",
      name: intl.formatMessage({
        id: "edit.name.and.description",
        defaultMessage: "Edit Name and Description",
      }),
      ActionWrapper: require("../action/update-modal").default,
      preValidators: [verifySingle],
    },
    {
      key: "delete",
      icon: "trash",
      preValidators: [verifyMulti],
      ActionWrapper: require("../action/delete-email-server-setting").default,
    },
    {
      key: "set.share.mode",
      ActionWrapper: SetShareTypeFromNoGroup,
    },
  ]);
};
