import DetachClusterConfirm from "@zstack/virtualization-resource/src/pages/cluster/action/primaryStorage/detach-in-primary-storage-modal";
import ClusterList from "@zstack/virtualization-resource/src/pages/primary-storage/components/cluster-select";
import { ModalSelect } from "@zstack/zsphere-components";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  PrimaryStorageVO as IPrimaryStorage,
  Cluster as ICluster,
} from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";

const DetachClusterList: React.FC<IActionWrapperProps<IPrimaryStorage>> = ({
  visible,
  setVisible,
  refetch,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const [value, onChange] = useState<ICluster[]>([]);
  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
  const attachedClusterUuids = selectedList?.[0]?.attachedClusterUuids || [];

  useEffect(() => {
    if (!confirmVisible) {
      onChange([]);
    }
  }, [confirmVisible]);

  return (
    <>
      <ModalSelect
        title={intl.formatMessage({
          id: "select.cluster",
          defaultMessage: "Select Cluster",
        })}
        value={value}
        visible={visible}
        setVisible={setVisible}
        showSelect={false}
        onOk={(_value) => {
          onChange(_value);
          setConfirmVisible(true);
        }}
        selectType="checkbox"
        resourceName={formatResourceName(selectedList, intl)}
      >
        <ClusterList
          current={selectedList?.[0]}
          view="select.primary.storage"
          defaultQuery={{
            conditions: [
              { key: "uuid", op: Op.in, values: attachedClusterUuids },
            ],
          }}
        />
      </ModalSelect>
      {value?.[0]?.hypervisorType !== "baremetal2" && (
        <DetachClusterConfirm
          view="main"
          position="row"
          visible={confirmVisible}
          setVisible={setConfirmVisible}
          source={selectedList?.[0]}
          selectedList={value}
          refetch={refetch}
          setSelectedList={setSelectedList as () => void}
        />
      )}
    </>
  );
};

export default DetachClusterList;
