import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const detachZone = gql`
  mutation detachBackupStorageFromZone(
    $input: DetachBackupStorageFromZoneInput!
  ) {
    detachBackupStorageFromZone(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IZone>> = ({
  refetch,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  source,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const onOk = async () => {
    setVisible(false);

    doAction({
      mutation: detachZone,
      payload: selectedList.map((cv) => ({
        zoneUuid: cv.uuid,
        backupStorageUuid: source?.current?.uuid,
      })),

      name: intl.formatMessage({
        id: "detach.zone",
        defaultMessage: "Detach  Data Center",
      }),
      total: selectedList.length,
      type: "Zone",
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
      title={intl.formatMessage({
        id: "zone.modal.title.confirm.detach.zone",
        defaultMessage: "Detach Data Center?",
      })}
      resourceNames={selectedList.map((r) => r.name)}
    />
  );
};

export default Action;
