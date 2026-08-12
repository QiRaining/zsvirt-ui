import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  DetachNvmeServerFromClusterPayload,
  NvmeServer as INvmeServer,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const detachNvmeServerFromClusters = gql`
  mutation detachNvmeServerFromClusters(
    $input: DetachNvmeServerFromClusterInput!
  ) {
    detachNvmeServerFromClusters(input: $input) {
      actionId
    }
  }
`;

const DetachCluster: React.FC<IActionWrapperProps<INvmeServer>> = ({
  visible,
  setVisible,
  selectedList = [],
  source,
  setSelectedList,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = () => {
    const payload: DetachNvmeServerFromClusterPayload[] =
      selectedList?.map(({ uuid }) => ({
        uuid: source?.uuid,
        clusterUuid: uuid,
      })) || [];
    doAction({
      mutation: detachNvmeServerFromClusters,
      payload,
      type: "NvmeServer",
      name: intl.formatMessage({
        id: "detach.cluster",
        defaultMessage: "Detach Cluster",
      }),
      total: payload?.length || 1,
      onFinish: () => {
        setSelectedList?.([]);
        refetch?.();
      },
    });
    setVisible(false);
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "nvmeServerStorage.modal.title.confirm.detach.cluster",
        defaultMessage: "Detach Cluster?",
      })}
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "nvmeServerStorage.modal.detach.cluster.alert",
            defaultMessage: `1. After detaching, the connection between the NVMe storage and all hosts in the cluster will be disconnected, impacting related business operations.
2. SAN storage and virtual machines in the cluster will no longer be able to access the LUN devices provided by the NVMe storage. Proceed with caution.`,
          })}
        </ReactMarkdown>
      }
      resourceType={intl.formatMessage({
        id: "nvmeServerStorage",
        defaultMessage: "NVMe Storage",
      })}
      resourceNames={selectedList.map((r) => r.name ?? r.uuid)}
      onConfirm={onOk}
    />
  );
};

export default DetachCluster;
