import { gql, useLazyQuery } from "@apollo/client";
import { getPrimaryStorageRelatedResourceCounts } from "@zstack/virtualization-resource/src/gql/primary-storage.gql";
import { volumeFields as commonVolumeFields } from "@zstack/virtualization-resource/src/gql/volume-fragment.gql";
import ClusterList from "@zstack/virtualization-resource/src/pages/cluster/list";
import HostList from "@zstack/virtualization-resource/src/pages/host/list";
import VMList from "@zstack/virtualization-resource/src/pages/vm/list";
import VolumeList from "@zstack/virtualization-resource/src/pages/volume/list";
import { DetailNavLayout } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { IQuery, IActionSubscribe } from "@zstack/zsphere-types";
import { Op, PrimaryStorageType } from "@zstack/zsphere-types";
import type {
  PrimaryStorage as IPrimaryStorage,
  PrimaryStorageRelatedResourceCounts as IPrimaryStorageRelatedResourceCounts,
} from "@zstack/zsphere-types/graphql";
import { includes, remove } from "lodash-es";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

const CONTAINER_STYLE = { height: "100%" } as const;

const volumeList = gql`
  ${commonVolumeFields}

  query volumeList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $extraConditions: [Condition!]
    $type: VolumeQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
    $vmInstanceUuid: String
  ) {
    volumeList(
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      extraConditions: $extraConditions
      type: $type
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        ...volumeFields
        # 模板
        templatedVmInstance {
          uuid
          name
        }
        # 模板缓存
        templatedVmInstanceCache {
          uuid
          name
        }
      }
    }
  }
`;

interface IProps {
  current: IPrimaryStorage;
}

const Config: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const [
    getStorgeRelatedResourcesCount,
    { data: storgeRelatedResourcesCountData },
  ] = useLazyQuery<{
    getPrimaryStorageRelatedResourceCounts: IPrimaryStorageRelatedResourceCounts;
  }>(getPrimaryStorageRelatedResourceCounts, {
    fetchPolicy: "no-cache",
    variables: {
      uuid: current.uuid,
    },
  });

  useEffect(() => {
    if (current?.uuid) {
      getStorgeRelatedResourcesCount();
    }
  }, [current?.uuid]);

  const summary =
    storgeRelatedResourcesCountData?.getPrimaryStorageRelatedResourceCounts ?? {
      vm: 0,
      hardDisk: 0,
      host: 0,
      cluster: 0,
    };

  useActionSubscribe({
    resourceTypeList: [
      "VmInstance",
      "Volume",
      "HostVO",
      "Cluster",
      "PrimaryStorageVO",
    ],
    onFinish: () => {
      getStorgeRelatedResourcesCount();
    },
  } as IActionSubscribe);
  const pageList = useMemo(() => {
    const _pageList = [
      {
        key: "virtualization.primaryStorage.virtualMachine",
        name: intl.formatMessage({
          id: "virtualMachine",
          defaultMessage: "VM",
        }),
        showTitle: true,
        auth: {
          type: "view",
          authKey: "list",
          resource: "virtualization.vm",
        } as any,
        page: (
          <VMList
            key={current?.uuid}
            source={current}
            customView="virtualization.custom"
            withResourceAttribute
            view="sub.virtualization.primary.storage"
            defaultQuery={{
              conditions: [
                {
                  key: "rootVolume.primaryStorage.uuid",
                  op: Op.eq,
                  value: current.uuid,
                },
                {
                  key: "state",
                  op: Op.ne,
                  value: "Destroyed",
                },
                {
                  key: "type",
                  op: Op.eq,
                  value: "UserVm",
                },
              ],
            }}
          />
        ),
        count: summary.vm,
      },
      {
        key: "virtualization.primaryStorage.hardDrive",
        name: intl.formatMessage({
          id: "primaryStorage.hardDrive",
          defaultMessage: "Disk",
        }),
        showTitle: true,
        page: (
          <VolumeList
            gql={volumeList}
            view="sub.virtualization.primary-storage"
            source={current}
            defaultQuery={{
              conditions: [
                {
                  key: "primaryStorage.uuid",
                  op: Op.eq,
                  value: current.uuid,
                },
                {
                  key: "status",
                  op: Op.ne,
                  value: "Deleted",
                },
                // {
                //   key: 'type',
                //   op: Op.eq,
                //   value: 'Data'
                // }
              ],
            }}
          />
        ),
        count: summary.hardDisk,
      },
      {
        key: "virtualization.primaryStorage.host",
        name: intl.formatMessage({
          id: "virtualization.primaryStorage.host",
          defaultMessage: "Host",
        }),
        showTitle: true,
        auth: {
          type: "view",
          authKey: "list",
          resource: "virtualization.host",
        } as any,
        page: (
          <HostList
            view="sub.virtualization.primary.storage"
            source={current}
            defaultQuery={
              {
                conditions: [
                  {
                    key: "cluster.primaryStorage.uuid",
                    value: current.uuid,
                    op: Op.eq,
                  },
                ],
                primaryStorageUuid: current.uuid,
              } as IQuery
            }
          />
        ),
        count: summary.host,
      },
      {
        key: "virtualization.cluster",
        name: intl.formatMessage({
          id: "virtualization.cluster",
          defaultMessage: "Cluster",
        }),
        showTitle: true,
        auth: {
          type: "view",
          authKey: "list",
          resource: "virtualization.cluster",
        } as any,
        page: (
          <ClusterList
            source={current}
            view="sub.virtualization.primary.storage"
            defaultQuery={{
              conditions: [
                {
                  key: "primaryStorage.uuid",
                  value: current.uuid,
                  op: Op.eq,
                },
                {
                  key: "hypervisorType",
                  value: "baremetal2",
                  op: Op.ne,
                },
              ],
            }}
          />
        ),
        count: summary.cluster,
      },
    ];

    if (!includes([PrimaryStorageType.LocalStorage], current?.type)) {
      remove(
        _pageList,
        (it) => it.key === "virtualization.primaryStorage.host",
      );
    }

    return _pageList;
  }, [intl, current, summary]);

  return (
    <div style={CONTAINER_STYLE}>
      <DetailNavLayout pageList={pageList} />
    </div>
  );
};

export default Config;
