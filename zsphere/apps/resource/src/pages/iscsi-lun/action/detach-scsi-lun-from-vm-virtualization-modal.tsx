import { gql } from "@apollo/client";
import VMList from "@zstack/virtualization-resource/src/pages/vm/list";
import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op, VmQueryType } from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  IscsiLun as IIscsiLun,
  DetachScsiLunFromVmInstancePayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams, useLocation } from "react-router";

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

const Action: React.FC<IActionWrapperProps<IIscsiLun>> = ({
  source,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  refetch,
}) => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const scsiLunUuid = getUuid(selectedList, searchParams, location);
  const doAction = useAction();

  const onOk = (value: IVM[]) => {
    const payload: DetachScsiLunFromVmInstancePayload[] = value.map(
      ({ uuid }) => ({
        uuid: scsiLunUuid,
        vmInstanceUuid: uuid,
      }),
    );
    doAction({
      mutation: _detachScsiLunFromVmInstance,
      payload,
      name: intl.formatMessage({
        id: "detach.vm",
        defaultMessage: "Detach Virtual Machine",
      }),
      total: payload?.length || 1,
      type: "ScsiLun",
      onFinish: () => {
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
          type: VmQueryType.GetVmCandidatesForDetachScsiLun,
          extraConditions: [
            { key: "scsiLunUuid", op: Op.eq, value: scsiLunUuid },
          ],
        }}
      />
    </ModalSelect>
  );
};

export default Action;
