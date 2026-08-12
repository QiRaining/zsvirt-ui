import { gql } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/snapshot-strategy";
import { useAction } from "@zstack/zsphere-hooks";
import { SchedulerJobState } from "@zstack/zsphere-types";
import type {
  SnapshotStrategy,
  UpdateSnapshotStrategyPayload,
} from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import Create from "../action/create";
import Delete from "../action/delete";
import Disable from "../action/disable";
import Edit from "../action/edit";
import EditNameDesc from "../action/edit-name-desc";

const updateSnapshotStrategy = gql`
  mutation updateSnapshotStrategy($input: UpdateSnapshotStrategyInput!) {
    updateSnapshotStrategy(input: $input) {
      actionId
    }
  }
`;

export default () => {
  const intl = useIntl();
  const doAction = useAction();

  return useActionConfig<SnapshotStrategy>([
    {
      key: "virtualization.create",
      autoInjectPreValidator: false,
      primary: true,
      ActionWrapper: Create,
    },
    {
      key: "virtualization.enable",
      validators: [(current) => current.state === SchedulerJobState.Disabled],
      onClick: ({ selectedList }) => {
        const payload = selectedList.map((item) => {
          const result: UpdateSnapshotStrategyPayload = {
            schedulerJobGroupUuid: item.uuid,
            state: SchedulerJobState.Enabled,
          };
          return result;
        });
        doAction({
          mutation: updateSnapshotStrategy,
          payload,
          name: intl.formatMessage({
            id: "enable.snapshot.strategy",
            defaultMessage: "Enable Snapshot Policy",
          }),
          total: selectedList.length,
          type: "SnapshotStrategy",
        });
      },
    },
    {
      key: "virtualization.disable",
      validators: [(current) => current.state === SchedulerJobState.Enabled],
      ActionWrapper: Disable,
    },
    {
      key: "virtualization.edit",
      ActionWrapper: Edit,
    },
    {
      key: "virtualization.delete",
      ActionWrapper: Delete,
    },
    {
      key: "virtualization.editNameDescription",
      ActionWrapper: EditNameDesc,
    },
  ]);
};
