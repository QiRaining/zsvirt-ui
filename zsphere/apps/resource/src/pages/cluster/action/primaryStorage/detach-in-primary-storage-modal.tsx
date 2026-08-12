import { gql, useQuery } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  Cluster as ICluster,
  PrimaryStorageRelatedClusterSummary as IPrimaryStorageRelatedClusterSummary,
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

const Action: React.FC<IActionWrapperProps<ICluster>> = ({
  source,
  refetch,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  view,
}) => {
  //***处理敏感操作***
  const needValidate = useSensitiveJudge();

  const intl = useIntl();
  const doAction = useAction();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const primaryStorageUuid =
    source?.uuid || getUuid(selectedList, searchParams);

  const {
    data: { getPrimaryStorageRelatedClusterSummary: relatedSummary } = {},
  } = useQuery<{
    getPrimaryStorageRelatedClusterSummary: IPrimaryStorageRelatedClusterSummary;
  }>(summaryGql, {
    variables: {
      clusterUuids: selectedList?.map((cluster) => cluster?.uuid),
      primaryStorageUuids: [primaryStorageUuid],
    },
  });

  const modalProps = React.useMemo(() => {
    return {
      resourceType: intl.formatMessage({
        id: "virtualization.cluster",
        defaultMessage: "Cluster",
      }),
      bannerMessage: (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "virtualization.primaryStorage.modal.detach.cluster.alert.danger",
            defaultMessage: `1. This operation will cause virtual machines on the selected data storage and in the associated cluster to power off, which may affect your business. Proceed with caution.

2. This operation will cause disks on the selected data storage and in the associated cluster unable to be used. Proceed with caution.`,
          })}
        </ReactMarkdown>
      ),
    };
  }, [needValidate, relatedSummary]);

  const onOk = async () => {
    setVisible(false);
    const payload = selectedList?.map((item) => ({
      clusterUuid: item.uuid,
      primaryStorageUuid,
    }));

    doAction({
      mutation: detachPrimaryStorageFromCluster,
      payload,
      name: intl.formatMessage({
        id: "detach.cluster",
        defaultMessage: "Detach Cluster",
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
    <DialogP1
      visible={visible}
      setVisible={setVisible}
      onConfirm={() => {
        onOk();
      }}
      title={intl.formatMessage({
        id: "cluster.modal.title.confirm.detach.cluster",
        defaultMessage: "Detach Cluster?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      {...modalProps}
    />
  );
};

export default Action;
