import { detachL2NetworkFromCluster } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Cluster } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { formatDoActionParams } from "../utils";

// 在二层网络详情 集群列表 卸载集群
const DetachClusterInSub: React.FC<IActionWrapperProps<Cluster>> = ({
  visible,
  setVisible,
  selectedList,
  source,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const clusterUuid = source?.uuid;

  const { name, title }: { name: string; title: string } = {
    name: intl.formatMessage({
      id: "detach.l2Network",
      defaultMessage: "Detach Distributed Switch",
    }),
    title: intl.formatMessage({
      id: "cluster.modal.title.confirm.detach.l2Network",
      defaultMessage: "Detach Distributed Switch?",
    }),
  };

  const resourceName: string = intl.formatMessage({
    id: "l2.network",
    defaultMessage: "Distributed Switch",
  });

  const onOk = () => {
    const payload = selectedList?.map((item) => ({
      l2NetworkUuid: item.uuid,
      clusterUuid,
    }));
    doAction(
      formatDoActionParams(
        {
          payload,
          action: {
            total: payload.length,
            name,
          },
          type: "L2Network",
        },
        detachL2NetworkFromCluster,
      ),
    );

    setVisible(false);
  };

  return (
    <DialogP1
      bannerMessage={intl.formatMessage({
        id: "detach.l2Network.from.baremetal.cluster.alert",
        defaultMessage:
          "Detach distributed switches will detach NICs from the associated bare metal instances in the cluster. Proceed with caution.",
      })}
      onConfirm={onOk}
      visible={visible}
      setVisible={setVisible}
      title={title}
      resourceType={resourceName}
      resourceNames={selectedList.map((r) => r.name ?? r.uuid)}
    />
  );
};

export default DetachClusterInSub;
