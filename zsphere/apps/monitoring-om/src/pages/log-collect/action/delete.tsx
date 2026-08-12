import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  DeleteLogCollectPayload,
  LogCollect,
} from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";

const deleteLogCollect = gql`
  mutation deleteLogCollect($input: DeleteLogCollectInput!) {
    deleteLogCollect(input: $input) {
      actionId
    }
  }
`;

interface IProps extends Omit<
  IActionWrapperProps<LogCollect>,
  "view" | "position"
> {}

const DeleteModal: FC<IProps> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  refetch,
}) => {
  const doAction = useAction();
  const intl = useIntl();

  useEffect(() => {
    if (!visible) {
      setSelectedList?.([]);
    }
  }, [visible]);

  const onOk = async () => {
    const payload: DeleteLogCollectPayload[] = selectedList.map((item) => {
      return {
        uuid: item.uuid,
      };
    });

    try {
      await doAction({
        mutation: deleteLogCollect,
        payload,
        name: intl.formatMessage({
          id: "delete.log",
          defaultMessage: "Delete Log",
        }),
        total: selectedList.length,
        type: "LogCollect",
        onFinish: () => {
          refetch?.();
          setSelectedList?.([]);
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "delete.log.modal.title.confirm",
        defaultMessage: "Delete Log?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={onOk}
    />
  );
};

export default DeleteModal;
