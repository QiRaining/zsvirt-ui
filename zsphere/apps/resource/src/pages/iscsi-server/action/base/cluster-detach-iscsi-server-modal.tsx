import { gql, useLazyQuery } from "@apollo/client";
import { getIscsiServerSummary } from "@zstack/virtualization-resource/src/gql/iscsi-server.gql";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  IscsiServer as IIscsiServer,
  DetachIscsiServerFromClusterPayload,
  IscsiServerRelateSummary as IIscsiServerRelateSummary,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "react-router";

const _detachIscsiServerFromClusters = gql`
  mutation detachIscsiServerFromClusters(
    $input: DetachIscsiServerFromClusterInput!
  ) {
    detachIscsiServerFromClusters(input: $input) {
      actionId
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

const DetachIscsiServerFromCluster: React.FC<
  IActionWrapperProps<IIscsiServer>
> = ({
  source,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [searchParams] = useSearchParams();
  const iscsiServerUuid =
    source?.current?.uuid || getUuid(selectedList, searchParams);
  const clusterList = selectedList;

  const [queryResourceCount, { data }] = useLazyQuery<{
    getIscsiServerSummary: IIscsiServerRelateSummary;
  }>(getIscsiServerSummary, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (visible && clusterList?.length > 0) {
      queryResourceCount({
        variables: {
          uuids: [iscsiServerUuid],
          clusterUuids: clusterList?.map((it) => it?.uuid),
        },
      });
    }
  }, [visible, clusterList]);

  const onOk = () => {
    const payload: DetachIscsiServerFromClusterPayload[] =
      clusterList.map(({ uuid }) => ({
        uuid: iscsiServerUuid,
        clusterUuid: uuid,
      })) || [];
    doAction({
      mutation: _detachIscsiServerFromClusters,
      payload,
      type: "Cluster",
      name: intl.formatMessage({
        id: "detach.cluster",
        defaultMessage: "Detach Cluster",
      }),
      total: payload?.length || 1,
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
    setVisible(false);
  };

  const linkedResourceMessage = useMemo(() => {
    const vmInstanceCount = data?.getIscsiServerSummary?.vmInstanceCount || 0;
    const volumeCount = data?.getIscsiServerSummary?.volumeCount || 0;

    return intl.formatMessage(
      {
        id: "virtualization.associatedCount.vm.volume.and.primaryStorage",
        defaultMessage: "{vmInstanceCount} VMs and {volumeCount} disks ",
      },
      {
        vmInstanceCount,
        volumeCount,
      },
    );
  }, [intl, data]);

  return (
    <DialogP1
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "cluster.modal.title.confirm.detach.cluster",
        defaultMessage: "Detach Cluster?",
      })}
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "cluster.modal.detach.cluster.alert.error",
            defaultMessage:
              "Detaching a cluster will terminate the connection between the host and iSCSI storage and may affect your business. Please exercise caution.",
          })}
        </ReactMarkdown>
      }
      resourceType={intl.formatMessage({
        id: "cluster",
        defaultMessage: "Cluster",
      })}
      resourceNames={clusterList.map((r) => r.name ?? r.uuid)}
      onConfirm={onOk}
    />
  );
};

export default DetachIscsiServerFromCluster;
