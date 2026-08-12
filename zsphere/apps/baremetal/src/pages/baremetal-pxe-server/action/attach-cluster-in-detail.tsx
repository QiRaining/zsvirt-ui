import { gql } from "@apollo/client";
import { TableSelect } from "@zstack/zsphere-components";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op, ClusterQueryType } from "@zstack/zsphere-types";
import type {
  BaremetalPxeServer as IBaremetalPxeServer,
  Cluster as ICluster,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import ClusterList from "../../baremetal-cluster/list";

const attachBaremetalPxeServer = gql`
  mutation ($input: AttachBaremetalPxeServerInput!) {
    attachBaremetalPxeServer(input: $input) {
      actionId
    }
  }
`;

const AttachCluster: React.FC<IActionWrapperProps<IBaremetalPxeServer>> = ({
  visible,
  setVisible,
  refetch,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const { currentZone } = usePlatformStore();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const onOk = (v: ICluster[]) => {
    const payload = v?.map((item) => ({
      clusterUuid: item.uuid,
      pxeServerUuid: uuid,
    }));

    doAction({
      mutation: attachBaremetalPxeServer,
      payload,
      name: intl.formatMessage({
        id: "baremetal.pxeservice.action.attach.cluster",
        defaultMessage: "Attach Bare Metal Cluster",
      }),
      total: v.length,
      type: "BaremetalPxeServer",
      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      onFinish: (result: IActionResult) => {
        console.log(result);
        setSelectedList?.([]);
        refetch?.();
      },
    });
  };

  return (
    <TableSelect
      title={intl.formatMessage({
        id: "baremetal.pxeservice.action.attach.cluster",
        defaultMessage: "Attach Bare Metal Cluster",
      })}
      visible={visible}
      showSelect={false}
      selectType="checkbox"
      setVisible={setVisible}
      onOk={onOk}
    >
      <ClusterList
        view="select.baremetalpxeservice.baremetal"
        defaultQuery={{
          conditions: [
            {
              key: "state",
              op: Op.eq,
              value: "Enabled",
            },
            {
              key: "zoneUuid",
              op: Op.eq,
              value: currentZone.uuid,
            },
            {
              key: "hypervisorType",
              op: Op.eq,
              value: "baremetal",
            },
          ],
          type: ClusterQueryType.BaremetalPxeserviceAttachableCluster,
        }}
      />
    </TableSelect>
  );
};

export default AttachCluster;
