import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { detachBackupStorageFromZone } from "../../../gql/zone.gql";

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
      mutation: detachBackupStorageFromZone,
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
    <DialogP1
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
      title={intl.formatMessage({
        id: "zone.modal.title.confirm.detach.zone",
        defaultMessage: "Detach Data Center?",
      })}
      bannerMessage={intl.formatMessage({
        id: "zone.modal.detach.alert.danger",
        defaultMessage:
          "Detaching zones will detach all of its subresources, including clusters, hosts, networks, primary storages, and vCenters. Exercise caution when performing this operation.",
      })}
      resourceType={intl.formatMessage({ id: "zone", defaultMessage: "Data Center" })}
      resourceNames={selectedList.map((r) => r.name ?? r.uuid)}
    />
  );
};

export default Action;
