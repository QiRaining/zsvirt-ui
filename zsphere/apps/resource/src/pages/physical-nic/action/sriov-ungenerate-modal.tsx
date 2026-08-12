import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { PhysicalNic } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const unGenerateSriovPciDevice = gql`
  mutation unGenerateSriovPciDevice($input: UnGenerateSriovPciDeviceInput!) {
    unGenerateSriovPciDevice(input: $input) {
      actionId
    }
  }
`;

const DeleteAction: React.FC<IActionWrapperProps<PhysicalNic>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    const payload = {
      pciDeviceUuid: selectedList![0]?.pciDevice?.uuid,
    };
    doAction({
      mutation: unGenerateSriovPciDevice,
      payload,
      name: intl.formatMessage({
        id: "sriovUngenerate",
        defaultMessage: "SR-IOV Ungenerate",
      }),
      total: selectedList.length,
      type: "physicalNic",
      onFinish: () => {
        refetch?.();
      },
    });
    setSelectedList?.([]);
  };
  const onCancel = () => {
    setVisible(false);
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "physicalNic.modal.title.confirm.sriovUngenerate",
        defaultMessage: "SR-IOV Ungenerate?",
      })}
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "physicalNic.modal.ungenerate.alert.danger",
            defaultMessage:
              "The VF NICs created from the current physical NIC are in use by virtual machines. Restoring SR-IOV will also detach the related NICs from the virtual machines. Proceed with caution.",
          })}
        </ReactMarkdown>
      }
      resourceType={intl.formatMessage({
        id: "physicalNic",
        defaultMessage: "Physical NIC",
      })}
      resourceNames={(selectedList as any)?.map(
        (r: any) => r.interfaceName ?? r.name ?? r.uuid,
      )}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default DeleteAction;
