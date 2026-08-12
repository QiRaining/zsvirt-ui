import { gql } from "@apollo/client";
import { DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { CephMonType } from "@zstack/zsphere-types";
import type {
  CephMon as ICephMon,
  DeleteCephMonPayload as IDeleteCephMonPayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

const deleteCephMonList = gql`
  mutation deleteCephMonList($input: DeleteCephMonListInput!) {
    deleteCephMonList(input: $input) {
      actionId
    }
  }
`;

const DeleteModal: React.FC<IActionWrapperProps<ICephMon>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const needValidate = useSensitiveJudge(); //***处理敏感操作***
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const onOk = async () => {
    // 判断类型：如果都有primaryStorage字段，则为PrimaryStorage类型
    const type = selectedList?.every((item) => item.primaryStorageUuid)
      ? CephMonType.PrimaryStorage
      : CephMonType.BackupStorage;

    const payload: IDeleteCephMonPayload[] = selectedList?.map((item) => {
      return {
        type,
        uuid,
        monHostnames: [item.hostname || ""],
      };
    });

    doAction({
      mutation: deleteCephMonList,
      payload,
      name: intl.formatMessage({
        id: "delete.monitoringNode",
        defaultMessage: "Delete Monitoring Node",
      }),
      total: selectedList?.length,
      onFinish: () => {
        setSelectedList?.([]);
        refetch?.();
      },
    });
  };

  return (
    <DialogP0Smart
      bannerMessage={intl.formatMessage({
        id: "monitoringNode.modal.delete.monitoringNode.alert.warning",
        defaultMessage: "This operation may cause image storage disconnected. Proceed with caution.",
      })}
      title={intl.formatMessage({
        id: "monitoringNode.modal.title.confirm.delete.monitoringNode",
        defaultMessage: "Delete Monitoring Node?",
      })}
      resourceType={intl.formatMessage({
        id: "monitoringNode",
        defaultMessage: "Monitoring Node",
      })}
      resourceNames={
        selectedList?.map((mons) => mons.hostname ?? mons.uuid) || []
      }
      visible={visible}
      setVisible={setVisible}
      needValidate={needValidate}
      onConfirm={onOk}
    />
  );
};

export default DeleteModal;
