import { useActionConfig } from "@zstack/zsphere-engine/src/account-information";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { State as StateEnum } from "@zstack/zsphere-types";
import type { AccountVO as IAccount } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import Shared from "zsv_administration_shared/account-information/action/shared";

import { updateAccount } from "../../../../gql/account.gql";
import ShareResource from "../../action/batch-share-resource";
import BindRole from "../../action/bind-role";
import ModifyPassword from "../../action/modify-password";
import Recall from "../../action/recall";
import UpdateModal from "../../action/update-modal";
import { many, one, prohibitEdit } from "../../action/validator";
import AddUser from "../../user-group/action/add-user";
import RemoveUser from "../../user-group/action/remove-user";
import ChangeAccountTypeModal from "../action/change-account-type-modal";
import DeleteAccount from "../action/delete-account";
import DisabledModal from "../action/disabled-modal";
import JoinUserGroup from "../action/join-userGroup";
import ModifyConfig from "../action/modify-config";
import {
  verifyDisable,
  verifyEnable,
  verifyBySystemAdmin,
  verifyCanChangeToAdmin,
} from "../action/validator";
import CreateUser from "../create";

export default () => {
  const intl = useIntl();
  const doAction = useAction();

  const actions = useActionConfig<IAccount>([
    {
      key: "virtualization.new.user",
      autoInjectPreValidator: false,
      primary: true,
      ActionWrapper: CreateUser,
    },
    {
      key: "virtualization.edit.user.info",
      preValidators: [one],
      validators: [prohibitEdit],
      tooltip: intl.formatMessage({
        id: "account.action.edit.user.tooltip",
        defaultMessage: "You cannot edit the user information of an SSO user.",
      }),
      ActionWrapper: UpdateModal,
    },
    {
      key: "modify.config",
      ActionWrapper: ModifyConfig as React.FC<IActionWrapperProps<IAccount>>,
    },
    {
      key: "virtualization.delete",
      icon: "trash",
      preValidators: [many],
      ActionWrapper: DeleteAccount,
    },
    {
      key: "virtualization.edit.password",
      validators: [prohibitEdit],
      preValidators: [one],
      tooltip: intl.formatMessage({
        id: "account.action.edit.password.tooltip",
        defaultMessage: "You cannot change the password of an SSO user.",
      }),
      ActionWrapper: ModifyPassword,
    },
    {
      key: "enable",
      icon: "play-circle-fill",
      iconStyle: {
        color: "#5ACA49",
      },
      preValidators: [verifyEnable],
      onClick: ({ selectedList, setSelectedList, refetch }) => {
        const payload = selectedList
          .filter((item) => item.state === StateEnum.Disabled)
          .map((it) => ({ uuid: it.uuid, state: StateEnum.Enabled }));

        doAction({
          mutation: updateAccount,
          payload,
          name: intl.formatMessage({
            id: "enable.account",
            defaultMessage: "Enable User",
          }),
          type: "AccountVO",
          total: payload.length,
          onFinish: () => {
            refetch?.();
            setSelectedList?.([]);
          },
        });
      },
    },
    {
      key: "disabled",
      icon: "stop-circle-fill",
      iconStyle: {
        color: "#F4454C",
      },
      preValidators: [verifyDisable],
      ActionWrapper: DisabledModal,
    },
    {
      key: "change.to.administrator.user",
      preValidators: [verifyCanChangeToAdmin],
      validators: [verifyBySystemAdmin],
      notSupportedModal: {
        title: intl.formatMessage({
          id: "unable.to.change.to.administrator.user",
          defaultMessage: "Cannot Change to Admin User",
        }),
        alertType: "info" as const,
        alertMessage: intl.formatMessage({
          id: "account.modal.message.only.normal.user.can.change",
          defaultMessage: "Only regular users can be changed to admin users.",
        }),
      },
      ActionWrapper: ChangeAccountTypeModal,
    },
    {
      key: "bind.role",
      ActionWrapper: BindRole,
      validators: [verifyBySystemAdmin],
      notSupportedModal: {
        title: intl.formatMessage({
          id: "unable.to.bind.role",
          defaultMessage: "Cannot Assign Role",
        }),
      },
    },
    {
      key: "join.user.group",
      validators: [verifyBySystemAdmin],
      notSupportedModal: {
        title: intl.formatMessage({
          id: "unable.to.join.user.group",
          defaultMessage: "Cannot Join User Group",
        }),
      },
      ActionWrapper: JoinUserGroup,
    },
    {
      key: "share.resource",
      validators: [verifyBySystemAdmin],
      notSupportedModal: {
        title: intl.formatMessage({
          id: "unable.to.share.resource",
          defaultMessage: "Cannot Share Resources",
        }),
      },
      ActionWrapper: ShareResource,
    },
    {
      key: "add.user",
      autoInjectPreValidator: false,
      ActionWrapper: AddUser as React.FC<IActionWrapperProps<IAccount>>,
    },
    {
      key: "remove.user",
      ActionWrapper: RemoveUser as React.FC<IActionWrapperProps<IAccount>>,
    },
    {
      key: "shared",
      autoInjectPreValidator: false,
      ActionWrapper: Shared as React.FC<IActionWrapperProps<IAccount>>,
    },
    {
      key: "recall",
      ActionWrapper: Recall as React.FC<IActionWrapperProps<IAccount>>,
    },
  ]);

  return actions;
};
