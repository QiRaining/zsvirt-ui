import { useActionConfig } from "@zstack/zsphere-engine/src/access-control-rule";
import type { IOption } from "@zstack/zsphere-engine/src/access-control-rule/useActionConfig";
import type { AccessControlRule as IAccessControlRule } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

export default () => {
  const intl = useIntl();

  const actionConfig: IOption<IAccessControlRule> = React.useMemo<
    IOption<IAccessControlRule>
  >(
    () => [
      {
        key: "virtualization.add.accessControlRule",
        autoInjectPreValidator: false,
        primary: true,
        ActionWrapper: require("../action/add").default,
      },
      {
        key: "edit",
        icon: "edit",
        name: intl.formatMessage({
          id: "edit.name.and.description",
          defaultMessage: "Edit Name and Description",
        }),
        ActionWrapper: require("../action/edit").default,
      },
      {
        key: "modify.config",
        ActionWrapper: require("../action/modify-config").default,
      },
      {
        key: "delete",
        ActionWrapper: require("../action/delete").default,
      },
    ],
    [intl],
  );

  return useActionConfig<IAccessControlRule>(actionConfig);
};
