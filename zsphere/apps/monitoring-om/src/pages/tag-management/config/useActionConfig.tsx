import { useActionConfig } from "@zstack/zsphere-engine/src/tag";
import type { IOption } from "@zstack/zsphere-engine/src/tag/useActionConfig";
import type { Tag as ITag } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { verifyMultipleOwnerTag } from "../action/validators";

export default () => {
  const intl = useIntl();

  const options = React.useMemo<IOption<ITag>>(
    () => [
      {
        key: "virtualization.create.tag",
        autoInjectPreValidator: false,
        primary: true,
        ActionWrapper: require("../action/create-tag").default,
      },
      {
        key: "virtualization.edit.tag",
        ActionWrapper: require("../action/update").default,
      },
      {
        key: "virtualization.bind.resource",
        preValidators: [verifyMultipleOwnerTag],
        ActionWrapper: require("../action/bind-resource").default,
        tooltip: intl.formatMessage({
          id: "virtualization.tag.action.bindResource.disabled.tooltip",
          defaultMessage: "This operation is not supported when the selected label owners belong to different users.",
        }),
      },
      {
        key: "delete",
        ActionWrapper: require("../action/delete").default,
      },
    ],
    [intl],
  );

  return useActionConfig<ITag>(options);
};
