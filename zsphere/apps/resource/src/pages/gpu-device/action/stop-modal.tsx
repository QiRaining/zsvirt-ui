import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { PciDeviceState } from "@zstack/zsphere-types";
import type { PciDevice as IPciDevice } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const updatePciDevice = gql`
  mutation updatePciDevice($input: UpdatePciDeviceInput!) {
    updatePciDevice(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IPciDevice>> = ({
  refetch,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    const payload = selectedList?.map((item: IPciDevice) => ({
      state: PciDeviceState.Disabled,
      uuid: item.uuid,
    }));

    doAction({
      mutation: updatePciDevice,
      payload,
      name: intl.formatMessage({
        id: "stop.gpu.device",
        defaultMessage: "Disable GPU",
      }),
      total: selectedList.length,
      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      onFinish: (result: IActionResult) => {
        console.log(result);
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "gpuDevice.modal.title.confirm.disable.gpuDevice",
        defaultMessage: "Disable GPU?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={onOk}
    />
  );
};

export default Action;
