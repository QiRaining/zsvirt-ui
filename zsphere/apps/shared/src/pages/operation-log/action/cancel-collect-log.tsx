import { gql } from "@apollo/client";
import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { useAction } from "@zstack/zsphere-hooks";
import type { OperationLog } from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import type { FC } from "react";
import { useIntl } from "react-intl";

const cancelLogCollect = gql`
  mutation cancelLogCollect($input: CancelLogCollectInput!) {
    cancelLogCollect(input: $input) {
      actionId
    }
  }
`;

const CancelLogCollect: FC<{
  operationLog: OperationLog;
  setVisible: (visible: boolean) => void;
}> = ({ operationLog, setVisible }) => {
  const intl = useIntl();
  const doAction = useAction();

  const cancel = usePersistFn(() => {
    const uuid = operationLog?.operationTasks?.[0].operationApis?.[0]?.apiId;
    const actionUuid = operationLog?.operationTasks?.[0].actionId;
    const taskUuid = operationLog?.operationTasks?.[0].taskId;
    doAction({
      mutation: cancelLogCollect,
      payload: {
        uuid,
        actionUuid,
        taskUuid,
      },
      name: intl.formatMessage({
        id: "cancel.task",
        defaultMessage: "Cancel Task",
      }),
      total: 1,
      type: "LogCollect",
      onFinish: () => {
        setVisible(false);
      },
    });
  });

  return (
    <div
      style={{
        flexGrow: 10,
        justifyContent: "flex-start",
        display: "flex",
      }}
    >
      <Button
        variant="secondary"
        onClick={() => cancel()}
        icon={<Icon type="minus-circle" />}
      >
        {intl.formatMessage({
          id: "operation.cancel",
          defaultMessage: "Cancel",
        })}
      </Button>
    </div>
  );
};

export default CancelLogCollect;
