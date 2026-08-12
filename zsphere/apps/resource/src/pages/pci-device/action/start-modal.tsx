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
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    const payload = selectedList?.map((item: IPciDevice) => ({
      state: PciDeviceState.Enabled,
      uuid: item.uuid,
    }));

    doAction({
      mutation: updatePciDevice,
      payload,
      name: intl.formatMessage({
        id: "start.device",
        defaultMessage: "Start Device",
      }),
      total: selectedList.length,
      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      onFinish: (result: IActionResult) => {
        console.log(result);
        setSelectedList?.([]);
      },
    });

    setVisible(false);
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "pciDevice.modal.title.confirm.start.device",
        defaultMessage: "Start Device?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={onOk}
    />
  );
};

export default Action;
