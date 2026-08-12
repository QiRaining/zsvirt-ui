import { gql } from "@apollo/client";
import VMList from "@zstack/virtualization-resource/src/pages/vm/list";
import { ModalSelect } from "@zstack/zsphere-components";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op, VmQueryType } from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  IscsiLun as IIscsiLun,
  AttachScsiLunToVmInstancePayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams, useLocation } from "react-router";

const _attachScsiLunToVmInstances = gql`
  mutation attachScsiLunToVmInstances($input: AttachScsiLunToVmInstanceInput!) {
    attachScsiLunToVmInstances(input: $input) {
      actionId
    }
  }
`;

const getUuid = <T extends { uuid: string }>(
  selectedList: T[],
  searchParams: URLSearchParams,
  location: Location,
) => {
  const uuid = searchParams.get("uuid");

  // 在detail页面
  if (uuid && location.pathname?.includes("scsi-lun/detail")) {
    return uuid;
  }

  // list 页面
  return selectedList?.[0]?.uuid;
};

const AttachScsiLunToVmInstance: React.FC<IActionWrapperProps<IIscsiLun>> = ({
  source,
  refetch,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const scsiLunUuid = getUuid(selectedList, searchParams, location);

  // const scsiLun = selectedList?.[0] || {}
  // const vmInstanceUuids = scsiLun?.scsiLunVmInstanceRefs?.map(it => it.vmInstanceUuid) as string[]

  const doAction = useAction();

  const onOk = (value: IVM[]) => {
    const payload: AttachScsiLunToVmInstancePayload[] = value.map(
      ({ uuid }) => ({
        uuid: scsiLunUuid,
        vmInstanceUuid: uuid,
      }),
    );
    doAction({
      mutation: _attachScsiLunToVmInstances,
      payload,
      name: intl.formatMessage({
        id: "attach.vm",
        defaultMessage: "Attach Virtual Machine",
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
    <ModalSelect
      title={intl.formatMessage({
        id: "select.vm",
        defaultMessage: "Select Virtual Machine",
      })}
      selectType="checkbox"
      modalWidth={800}
      visible={visible}
      setVisible={setVisible}
      showSelect={false}
      onOk={onOk}
    >
      <VMList
        view="select"
        defaultQuery={{
          type: VmQueryType.GetVmCandidatesForAttachingScsiLun,
          conditions: [
            {
              key: "hypervisorType",
              op: Op.ne,
              value: "ESX",
            },
            {
              key: "type",
              op: Op.eq,
              value: "UserVm",
            },
          ],
          extraConditions: [
            { key: "scsiLunUuid", op: Op.eq, value: scsiLunUuid },
          ],
        }}
      />
    </ModalSelect>
  );
};

export default AttachScsiLunToVmInstance;
