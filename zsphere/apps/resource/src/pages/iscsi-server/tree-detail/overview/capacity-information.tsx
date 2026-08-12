import { getBlockDeviceInfo } from "@zstack/virtualization-resource/src/gql/primary-storage.gql";
import { useLazyQuery, DraggableCard } from "@zstack/zsphere-components";
import type { PrimaryStorageVO as IPrimaryStorage } from "@zstack/zsphere-types/graphql";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";

interface IProps {
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  detail: IPrimaryStorage;
}

const CapacityInformation: React.FC<IProps> = ({
  onCollapseChange,
  collapsed = false,
  detail,
}) => {
  const intl = useIntl();

  const [getBlockDevice] = useLazyQuery(getBlockDeviceInfo, {
    variables: {
      uuid: detail?.uuid,
    },
  });

  useEffect(() => {
    if (detail?.type === "BlockStorage" && !!detail?.uuid) {
      getBlockDevice();
    }
  }, [getBlockDevice, detail?.type, detail?.uuid]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "capacityInformation",
        defaultMessage: "Capacity Info",
      })}
      // isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
    >
      need to do
      {/* <List list={list} bordered={false} /> */}
    </DraggableCard>
  );
};

export default CapacityInformation;
