import { useActionConfig } from "@zstack/zsphere-engine/src/account-information";
import { useAction } from "@zstack/zsphere-hooks";
import { State } from "@zstack/zsphere-types";
import { useIntl } from "react-intl";

import { updateAccount } from "../../../../../gql/account.gql";
import DeleteAccount from "../../account/action/delete-account";
import DisabledModal from "../../account/action/disabled-modal";
import ModifyConfig from "../../account/action/modify-config";
import ModifyPassword from "../../action/modify-password";
import Recall from "../../action/recall";
import Shared from "../../action/shared";

export default () => {
  const intl = useIntl();
  const doAction = useAction();

  return useActionConfig([
    {
      key: "modify.config",
      ActionWrapper: ModifyConfig as any,
    },
    {
      key: "virtualization.delete",
      icon: "trash",
      ActionWrapper: DeleteAccount,
    },
    {
      key: "virtualization.edit.password",
      validators: [(current) => current.type !== "ThirdParty"],
      tooltip: intl.formatMessage({
        id: "account.action.edit.password.tooltip",
        defaultMessage: "You cannot change the password of an SSO user.",
      }),
      ActionWrapper: ModifyPassword,
    },
    {
      key: "enable",
      icon: "play-circle-fill",
      iconStyle: { color: "#5ACA49" },
      validators: [(current) => current.state === State.Disabled],
      onClick: ({ selectedList }) => {
        doAction({
          mutation: updateAccount,
          payload: selectedList.map(({ uuid }) => ({
            uuid,
            state: State.Enabled,
          })),
          name: intl.formatMessage({
            id: "enable.account",
            defaultMessage: "Enable User",
          }),
          type: "AccountVO",
          total: selectedList.length,
        });
      },
    },
    {
      key: "disabled",
      icon: "stop-circle-fill",
      iconStyle: { color: "#F4454C" },
      validators: [(current) => current.state === State.Enabled],
      ActionWrapper: DisabledModal,
    },
    {
      key: "shared",
      autoInjectPreValidator: false,
      ActionWrapper: Shared as any,
    },
    {
      key: "recall",
      ActionWrapper: Recall as any,
    },
  ]);
};
