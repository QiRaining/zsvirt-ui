import { gql, useQuery } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  PrimaryStorageRelatedClusterSummary as IPrimaryStorageRelatedClusterSummary,
  PrimaryStorageVO as IPrimaryStorage,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useNavigate, useSearchParams } from "react-router";

const detachPrimaryStorageFromCluster = gql`
  mutation detachPrimaryStorageFromCluster(
    $input: DetachPrimaryStorageFromClusterInput!
  ) {
    detachPrimaryStorageFromCluster(input: $input) {
      actionId
    }
  }
`;

const summaryGql = gql`
  query getPrimaryStorageRelatedClusterSummary(
    $clusterUuids: [String!]!
    $primaryStorageUuids: [String!]!
  ) {
    getPrimaryStorageRelatedClusterSummary(
      clusterUuids: $clusterUuids
      primaryStorageUuids: $primaryStorageUuids
    ) {
      vmCount
      vmOnNetworkCount
      vpcVrouterCount
      volumeCount
    }
  }
`;

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

const Action: React.FC<IActionWrapperProps<IPrimaryStorage>> = ({
  source,
  refetch,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  view,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clusterUuid = source?.uuid || getUuid(selectedList, searchParams);

  const {
    data: { getPrimaryStorageRelatedClusterSummary: relatedSummary } = {},
  } = useQuery<{
    getPrimaryStorageRelatedClusterSummary: IPrimaryStorageRelatedClusterSummary;
  }>(summaryGql, {
    variables: {
      clusterUuids: [clusterUuid],
      primaryStorageUuids: selectedList?.map((cluster) => cluster?.uuid),
    },
  });

  const linkedResourceMessage = intl.formatMessage(
    {
      id: "associatedCount.vm.router.volume.and.cluster",
      defaultMessage:
        "{vmCount} stopped virtual machines, {vmOnNetworkCount} virtual machines that might cause network exception, {vpcVrouterCount} VPC vRouters, and {volumeCount} disks ",
    },
    {
      vmCount: relatedSummary?.vmCount,
      vmOnNetworkCount: relatedSummary?.vmOnNetworkCount,
      // vrouterCount: relatedSummary?.vrouterCount,
      vpcVrouterCount: relatedSummary?.vpcVrouterCount,
      volumeCount: relatedSummary?.volumeCount,
    },
  );

  const onOk = async () => {
    const payload = selectedList?.map((item) => ({
      primaryStorageUuid: item.uuid,
      clusterUuid,
    }));
    doAction({
      mutation: detachPrimaryStorageFromCluster,
      payload,
      name: intl.formatMessage({
        id: "detach.primaryStorage",
        defaultMessage: "Detach Data Storage",
      }),
      total: selectedList.length,
      onFinish: () => {
        if (view === "sub") {
          navigate("/zone");
          return;
        }
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "primaryStorage.modal.detach.cluster.alert.danger",
            defaultMessage: `1. This operation will cause virtual machines on the selected data storage and in the associated cluster to power off, which may affect your business. Proceed with caution.

2. This operation will cause disks on the selected data storage and in the associated cluster unable to be used. Proceed with caution.`,
          })}
        </ReactMarkdown>
      }
      title={intl.formatMessage({
        id: "primaryStorage.modal.title.confirm.detach.primaryStorage",
        defaultMessage: "Detach Data Storage?",
      })}
      resourceType={intl.formatMessage({
        id: "primaryStorage",
        defaultMessage: "Data Storage",
      })}
      resourceNames={selectedList.map((r) => r.name ?? r.uuid)}
      linkedResourceMessage={linkedResourceMessage}
      onConfirm={onOk}
    />
  );
};

export default Action;
