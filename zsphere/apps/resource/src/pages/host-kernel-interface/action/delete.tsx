import { gql } from "@apollo/client";
import { useDetailStore } from "@zstack/virtualization-resource/src/pages/host-kernel-interface/hooks";
import { DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { HostKernelInterface } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const deleteHostKernelInterface = gql`
  mutation deleteHostKernelInterface($input: DeleteHostKernelInterfaceInput!) {
    deleteHostKernelInterface(input: $input) {
      actionId
    }
  }
`;

const Delete: React.FC<IActionWrapperProps<HostKernelInterface>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  //***处理敏感操作***
  const needValidate = useSensitiveJudge();

  const { setVisible: setDetailVisible } = useDetailStore();
  const onOk = () => {
    const payload = selectedList.map((item) => {
      return {
        uuid: item.uuid,
      };
    });
    doAction({
      mutation: deleteHostKernelInterface,
      payload,
      name: intl.formatMessage({
        id: "delete.zskernel",
        defaultMessage: "Delete Kernel Adapter.",
      }),
      total: selectedList.length,
      type: "HostKernelInterface",
      onFinish(result) {
        if (selectedList.length === 1 && result.success === 1) {
          setDetailVisible(false);
        }
      },
    });
  };
  return (
    <DialogP0Smart
      title={intl.formatMessage({
        id: "delete.zskernel.modal.title",
        defaultMessage: "Delete Kernel Adapter?",
      })}
      resourceType={intl.formatMessage({
        id: "zskernel",
        defaultMessage: "Kernel Adapter",
      })}
      bannerMessage={intl.formatMessage({
        id: "delete.zskernel.modal.alert.message",
        defaultMessage:
          "Deleting Kernel Adapters will release the associated IP addresses. Storage services dependent on these IPs will be interrupted. Proceed with caution.",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
      needValidate={needValidate}
    />
  );
};

export default Delete;
