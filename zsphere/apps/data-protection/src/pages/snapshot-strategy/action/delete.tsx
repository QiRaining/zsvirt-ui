import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { SnapshotStrategy } from "@zstack/zsphere-types/graphql";
import { useCallback } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

const deleteSnapshotStrategy = gql`
  mutation deleteSnapshotStrategy($input: DeleteSnapshotStrategyInput!) {
    deleteSnapshotStrategy(input: $input) {
      actionId
    }
  }
`;

export default function Delete({
  position,
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<SnapshotStrategy>) {
  const intl = useIntl();
  const doAction = useAction();
  const navigate = useNavigate();

  const onOk = useCallback(() => {
    doAction({
      mutation: deleteSnapshotStrategy,
      payload: selectedList.map((item) => ({
        uuid: item.uuid,
        triggerUuid: item.triggers[0]?.uuid,
      })),
      name: intl.formatMessage({
        id: "delete.snapshot.strategy",
        defaultMessage: "Delete Snapshot Policy",
      }),
      total: selectedList.length,
      type: "SnapshotStrategy",
      onFinish: (result) => {
        if (position === "header" && result.success === result.total) {
          navigate(-1);
        }
      },
    });
  }, [doAction, intl, selectedList, position]);

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "snapshot.strategy.delete.title",
        defaultMessage: "Delete Snapshot Policy?",
      })}
      resourceNames={selectedList.map((r) => r.name)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
}
