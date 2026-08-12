import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { SchedulerJobState } from "@zstack/zsphere-types";
import type {
  SnapshotStrategy,
  UpdateSnapshotStrategyPayload,
} from "@zstack/zsphere-types/graphql";
import { useCallback } from "react";
import { useIntl } from "react-intl";

const updateSnapshotStrategy = gql`
  mutation updateSnapshotStrategy($input: UpdateSnapshotStrategyInput!) {
    updateSnapshotStrategy(input: $input) {
      actionId
    }
  }
`;

export default function Disable({
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<SnapshotStrategy>) {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = useCallback(() => {
    const payload = selectedList.map((item) => {
      const result: UpdateSnapshotStrategyPayload = {
        schedulerJobGroupUuid: item.uuid,
        state: SchedulerJobState.Disabled,
      };
      return result;
    });
    doAction({
      mutation: updateSnapshotStrategy,
      payload,
      name: intl.formatMessage({
        id: "disable.snapshot.strategy",
        defaultMessage: "Disable Snapshot Policy",
      }),
      total: selectedList.length,
      type: "SnapshotStrategy",
    });
  }, [doAction, intl, selectedList]);

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "snapshot.strategy.disable.title",
        defaultMessage: "Disable Snapshot Policy?",
      })}
      resourceNames={selectedList.map((r) => r.name)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
}
