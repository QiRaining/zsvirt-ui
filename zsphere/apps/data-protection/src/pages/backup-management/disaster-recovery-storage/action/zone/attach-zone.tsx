import { gql } from "@apollo/client";
import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { ZonePlainList } from "zsv_resource_shared/zone/mf-index";

const attachZone = gql`
  mutation attachBackupStorageToZone($input: AttachBackupStorageToZoneInput!) {
    attachBackupStorageToZone(input: $input) {
      actionId
    }
  }
`;

const AttachZone: React.FC<IActionWrapperProps<IZone>> = ({
  visible,
  setVisible,
  refetch,
  setSelectedList,
  source,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = (values: any) => {
    const payload = values?.map((cv: IZone) => ({
      zoneUuid: cv?.uuid,
      backupStorageUuid: source?.current?.uuid,
    }));

    doAction({
      mutation: attachZone,
      payload,
      name: intl.formatMessage({
        id: "attach.zone",
        defaultMessage: "Attach  Data Center",
      }),
      total: 1,
      type: "Zone",
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <ModalSelect
      title={intl.formatMessage({
        id: "attach.zone",
        defaultMessage: "Attach  Data Center",
      })}
      visible={visible}
      setVisible={setVisible}
      showSelect={false}
      onOk={onOk}
      selectType="checkbox"
    >
      <ZonePlainList
        view="select"
        defaultQuery={{
          conditions: [
            { key: "uuid", op: Op.notIn, values: source?.notInUuids },
          ],
        }}
      />
    </ModalSelect>
  );
};

export default AttachZone;
