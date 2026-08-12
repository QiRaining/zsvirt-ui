import { detachL2NetworkFromCluster } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import { ETabType } from "@zstack/virtualization-resource/src/pages/cluster/constant";
import { formatDoActionParams } from "@zstack/virtualization-resource/src/pages/cluster/utils";
import { DialogP0 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Cluster, L2Network } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

// 在二层网络详情 集群列表 卸载集群
const DetachClusterInSub: React.FC<IActionWrapperProps<Cluster>> = ({
  visible,
  setVisible,
  selectedList,
  source,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const { current } = source ?? {};
  const l2 = current as L2Network;
  const l2NetworkUuid = l2?.uuid;

  const { name, title }: { name: string; title: string } = useMemo(() => {
    return {
      name: intl.formatMessage({
        id: "detach.cluster",
        defaultMessage: "Detach Cluster",
      }),
      title: intl.formatMessage({
        id: "l2Network.modal.title.confirm.detach.cluster",
        defaultMessage: "Detach Cluster?",
      }),
    };
  }, [intl]);

  const resourceName: string = useMemo(() => {
    return intl.formatMessage({ id: "cluster", defaultMessage: "Cluster" });
  }, [intl]);

  const alert = useMemo(() => {
    if (source?.type === ETabType.BAREMETAL) {
      return null;
    }
    return {
      alertType: "error" as const,
      alertMessage: intl.formatMessage({
        id: "detach.l2Network.alert",
        defaultMessage: "After detaching a cluster, the corresponding VM NICs will be removed. Proceed with caution.",
      }),
    };
  }, [intl, source?.type]);

  const onOk = () => {
    const payload = selectedList?.map((item) => ({
      l2NetworkUuid,
      clusterUuid: item.uuid,
    }));
    doAction(
      formatDoActionParams(
        {
          payload,
          action: {
            total: payload.length,
            name,
          },
          type: "Cluster",
        },
        detachL2NetworkFromCluster,
      ),
    );

    setVisible(false);
  };

  return (
    <DialogP0
      bannerMessage={alert?.alertMessage}
      onConfirm={onOk}
      visible={visible}
      setVisible={setVisible}
      title={title}
      resourceType={resourceName}
      resourceNames={selectedList.map((r) => r.name ?? r.uuid)}
      guide={intl.formatMessage({
        id: "detach",
        defaultMessage: "Detach",
      })}
    />
  );
};

export default DetachClusterInSub;
