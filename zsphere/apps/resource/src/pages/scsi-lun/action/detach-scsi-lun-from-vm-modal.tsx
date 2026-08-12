import { gql } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  ScsiLun as IScsiLun,
  DetachScsiLunFromVmInstancePayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

const _detachScsiLunFromVmInstance = gql`
  mutation detachScsiLunFromVmInstance(
    $input: DetachScsiLunFromVmInstanceInput!
  ) {
    detachScsiLunFromVmInstance(input: $input) {
      actionId
    }
  }
`;

const getUuid = <T extends { uuid: string }>(
  selectedList: T[],
  searchParams: URLSearchParams,
) => {
  const uuid = searchParams.get("uuid");

  // 在detail页面
  if (uuid) {
    return uuid;
  }

  // list 页面
  return selectedList?.[0]?.uuid;
};

const DetachDataVolumeFromVm: React.FC<IActionWrapperProps<IScsiLun>> = ({
  refetch,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [searchParams] = useSearchParams();
  const vmInstanceUuid = getUuid(selectedList, searchParams) as string;
  const iSCSIServerList = selectedList;

  const onOk = () => {
    const payload: DetachScsiLunFromVmInstancePayload[] = iSCSIServerList?.map(
      ({ uuid = "" }) => ({
        uuid,
        vmInstanceUuid,
      }),
    );
    doAction({
      mutation: _detachScsiLunFromVmInstance,
      payload,
      name: intl.formatMessage({
        id: "vmDetachBlockDevice",
        defaultMessage: "Detach LUN from VM",
      }),
      total: payload?.length || 1,
      type: "ScsiLun",
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
    <DialogP1
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "scsiLun.modal.title.confirm.vmDetachBlockDevice",
        defaultMessage: "Detach LUN from VM?",
      })}
      bannerMessage={intl.formatMessage({
        id: "blockDevice.modal.detach.vm.alert",
        defaultMessage:
          "This operation interrupts the data reads/writes of the disks and may affect the business continuity. Please exercise caution.",
      })}
      resourceType={intl.formatMessage({
        id: "block.device",
        defaultMessage: "LUN",
      })}
      resourceNames={iSCSIServerList.map((r) => r.name ?? r.uuid)}
      onConfirm={onOk}
    />
  );
};

export default DetachDataVolumeFromVm;
