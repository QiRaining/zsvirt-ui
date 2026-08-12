import { useActionConfig } from "@zstack/zsphere-engine/src/zsv-role";
import { ZsvRoleQueryType } from "@zstack/zsphere-types";
import type { ZsvRole as IRole } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import {
  verifyDelete,
  verifyMultiSelect,
  verifyPredefined,
  verifyClone,
} from "../action/validator";
import { transformRoleName } from "../utils";

export default () => {
  const intl = useIntl();

  const actions = useActionConfig<IRole>([
    {
      key: "create.role",
      autoInjectPreValidator: false,
      primary: true,
      ActionWrapper: require("../create").default,
    },
    {
      key: "clone.role",
      validators: [verifyClone],
      ActionWrapper: require("../action/clone-role").default,
    },
    {
      key: "virtualization.delete",
      ActionWrapper: require("../action/delete").default,
      notSupportedModal: {
        title: intl.formatMessage({
          id: "virtualization.delete.notSupported.title",
          defaultMessage: "Cannot Delete Role",
        }),
        getItemName: ({ name, uuid }: IRole) => {
          return transformRoleName(intl, { uuid, name });
        },
      },
      preValidators: [verifyMultiSelect],
      tooltip: ({ selectedList }) => {
        if (
          selectedList?.every((it) => it.type === ZsvRoleQueryType.Predefined)
        ) {
          return intl.formatMessage({
            id: "virtualization.delete.predefined.tooltip",
            defaultMessage: "You cannot delete a default role.",
          });
        }
        return "";
      },
      validators: [verifyDelete],
    },
    {
      key: "virtualization.edit.config",
      ActionWrapper: require("../action/edit-config").default,
      tooltip: intl.formatMessage({
        id: "virtualization.edit.config.predefined.tooltip",
        defaultMessage: "You cannot configure a default role.",
      }),
      validators: [verifyPredefined],
    },
  ]);

  return {
    ...actions,
    getItemName: ({ name, uuid }: IRole) => {
      return transformRoleName(intl, { uuid, name });
    },
  };
};
