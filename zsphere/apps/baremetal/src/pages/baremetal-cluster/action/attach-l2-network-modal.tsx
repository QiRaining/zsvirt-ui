import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { L2NetworkQueryType, Op } from "@zstack/zsphere-types";
import type {
  Cluster as ICluster,
  L2Network as IL2Network,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import List from "zsv_resource/l2-network/list";

import { attachL2NetworkToCluster } from "../../../gql/cluster-operations.gql";

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

// todo 集群加载二层网络能只能单个加载二层网络，集群卸载二层网络能多个卸载二层网络 ， 所有操作都只对单个集群有效
const AttachL2Network: React.FC<IActionWrapperProps<ICluster>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  refetch,
  source,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [searchParams] = useSearchParams();
  let clusterUuid: string;
  if (source?.__typename === "Zone") {
    clusterUuid = selectedList?.[0]?.uuid;
  } else {
    clusterUuid = source?.uuid || getUuid(selectedList, searchParams);
  }

  const onOk = (v: IL2Network[]) => {
    const payload = v?.map((item) => ({
      l2NetworkUuid: item.uuid,
      clusterUuid,
    }));

    doAction({
      mutation: attachL2NetworkToCluster,
      payload,
      name: intl.formatMessage({
        id: "attach.l2Network",
        defaultMessage: "Attach Distributed Switch",
      }),
      total: v?.length,
      type: "L2Network",
      onFinish: () => {
        refetch?.();
      },
    });
    setSelectedList?.([]);
  };

  return (
    <ModalSelect
      title={intl.formatMessage({
        id: "attach.l2Network",
        defaultMessage: "Attach Distributed Switch",
      })}
      visible={visible}
      showSelect={false}
      selectType="checkbox"
      setVisible={setVisible}
      onOk={onOk}
    >
      <List
        view="select.baremetal.cluster.attach"
        defaultQuery={{
          type: L2NetworkQueryType.BaremetalClusterAttachableL2network,
          extraConditions: [
            {
              key: "clusterUuid",
              op: Op.eq,
              value: clusterUuid,
            },
          ],
        }}
      />
    </ModalSelect>
  );
};

export default AttachL2Network;
