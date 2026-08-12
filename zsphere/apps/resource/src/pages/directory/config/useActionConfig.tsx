import { vmDirectoryGroupByUuid } from "@zstack/virtualization-resource/src/gql/vm-directory.gql";
import CreateInstance from "@zstack/virtualization-resource/src/pages/vm/create/enter-select-modal";
import { useActionConfig } from "@zstack/zsphere-engine/src/vm-dir-group";
import type { VMGroupDirectory } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import CreateGroup from "../action/create";
import DeleteGroup from "../action/delete";
import UpdateModal from "../action/update";
import { canCreateSubGroup, isNotDefaultDir } from "../action/validator";

export default () => {
  const intl = useIntl();
  const config = useActionConfig([
    {
      key: "delete",
      ActionWrapper: DeleteGroup,
      validators: [isNotDefaultDir],
    },
    {
      key: "edit",
      ActionWrapper: UpdateModal,
      validators: [isNotDefaultDir],
    },
    {
      key: "virtualization.create.sub.directory",
      ActionWrapper: CreateGroup,
      validators: [canCreateSubGroup, isNotDefaultDir],
      tooltip({ selectedList }: { selectedList: VMGroupDirectory[] }) {
        if (selectedList?.[0]) {
          const { uuid, groupName } = selectedList[0] ?? {};

          const level = groupName?.split("/").length;

          // 检查是否为默认分组
          if (groupName && uuid?.includes("-2")) {
            return intl.formatMessage({
              id: "group.default.limit",
              defaultMessage: "You cannot create new sub-groups under the default group.",
            });
          }

          if (level > 2) {
            return intl.formatMessage({
              id: "group.deepest.limit",
              defaultMessage:
                "Could not create sub-groups now. Only three levels of hierarchy are supported.",
            });
          }
        }
      },
      tooltipPlacement: "top",
    },
    {
      key: "virtualization.create.vm",
      ActionWrapper: CreateInstance,
    },
  ]);
  return {
    ...config,
    gql: vmDirectoryGroupByUuid,
  };
};
