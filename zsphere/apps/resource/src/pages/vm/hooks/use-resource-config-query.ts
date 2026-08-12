import { gql, useLazyQuery } from "@apollo/client";
import { Op } from "@zstack/zsphere-types";
import type { ResourceConfigInPage as IResourceConfigInPage } from "@zstack/zsphere-types/graphql";
import { useEffect, useMemo } from "react";

const RESOURCE_CONFIG_LIST = gql`
  query resourceConfigList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
  ) {
    resourceConfigList(
      conditions: $conditions
      extraConditions: $extraConditions
    ) {
      list {
        resourceType
        resourceUuid
        uuid
        globalConfigValue
        dependentResourceType
        value
        name
        category
      }
    }
  }
`;

const BACKUP_TASK_STATUS = gql`
  query backupTaskStatus(
    $isVm: Boolean!
    $rootVolumeUuids: [String!]!
    $dataVolumeUuids: [String!]!
  ) {
    backupTaskStatus(
      isVm: $isVm
      rootVolumeUuids: $rootVolumeUuids
      dataVolumeUuids: $dataVolumeUuids
    ) {
      progress
      isTaskRunning
      backupTaskStatusData {
        targetResourceUuid
        longJobUuids
      }
    }
  }
`;

export const useResourceConfigQuery = (
  uuid: string,
  categoryList: string[],
  nameList: string[],
  visible: boolean = true,
) => {
  const defaultQuery = {
    conditions: [
      {
        key: "categoryList",
        values: categoryList,
        op: Op.in,
      },
      {
        key: "nameList",
        values: nameList,
        op: Op.in,
      },
      {
        key: "resourceUuid",
        value: uuid,
        op: Op.eq,
      },
    ],
  };

  const [run, { data, refetch, loading }] = useLazyQuery(RESOURCE_CONFIG_LIST, {
    variables: defaultQuery,
  });

  useEffect(() => {
    if (visible && uuid) {
      run();
    }
  }, [visible, uuid, run]);

  const config = useMemo(() => {
    if (!data?.resourceConfigList?.list?.length) {
      return {};
    }
    const result: any = {};
    data?.resourceConfigList?.list.forEach((item: IResourceConfigInPage) => {
      result[item.name] = item;
    });
    return result;
  }, [data]);

  return [config, refetch, loading];
};

export const useVmBackupTaskStatus = (
  isVm: boolean,
  rootVolumeUuids: string[],
  dataVolumeUuids: string[],
  visible: boolean,
  skip: boolean = false,
) => {
  const [getVmBackupTaskStatus, { data, loading }] =
    useLazyQuery(BACKUP_TASK_STATUS);

  useEffect(() => {
    if (visible && !skip) {
      getVmBackupTaskStatus({
        variables: {
          isVm,
          rootVolumeUuids,
          dataVolumeUuids,
        },
      });
    }
  }, [
    rootVolumeUuids?.join(""),
    dataVolumeUuids?.join(""),
    visible,
    skip,
    isVm,
  ]);

  return {
    data,
    loading,
  };
};
