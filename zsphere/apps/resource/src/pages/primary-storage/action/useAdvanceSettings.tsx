import { gql, useQuery } from "@apollo/client";
import type { IconTypes } from "@zstack/zsphere-components";
import { Op, PrimaryStorageType } from "@zstack/zsphere-types";
import type {
  ResourceConfigList as IResourceConfigList,
  ResourceConfigInPage as IResourceConfigInPage,
  PrimaryStorageVO as IPrimaryStorage,
} from "@zstack/zsphere-types/graphql";
import { get, uniq, reduce, find } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

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

interface IConfigProps {
  category: string;
  name: string;
  label: string | React.ReactNode;
  value?: string | number;
  icon?: IconTypes;
  iconTooltip?: string | React.ReactNode;
  selectList?: { value: string; displayName: string }[];
}

export const useAdvancedSettings = (detail: IPrimaryStorage) => {
  const intl = useIntl();

  const configList = useMemo<IConfigProps[]>(() => {
    const typeMap = {
      [PrimaryStorageType.SharedMountPoint]: [
        {
          category: "mevoco",
          name: "overProvisioning.primaryStorage",
          label: intl.formatMessage({
            id: "resource.config.title.mevoco.overProvisioning.primaryStorage",
            defaultMessage: "Data Storage Overcommit Ratio",
          }),
        },
        {
          category: "sharedMountPointPrimaryStorage",
          name: "qcow2.allocation",
          label: intl.formatMessage({
            id: "resource.config.title.sharedMountPointPrimaryStorage.qcow2.allocation",
            defaultMessage: "Disk Preallocation Policy in SMP Storage",
          }),
        },
      ],
      [PrimaryStorageType.NFS]: [
        {
          category: "mevoco",
          name: "overProvisioning.primaryStorage",
          label: intl.formatMessage({
            id: "resource.config.title.mevoco.overProvisioning.primaryStorage",
            defaultMessage: "Data Storage Overcommit Ratio",
          }),
          icon: "info",
          iconTooltip: (
            <ReactMarkdown>
              {intl.formatMessage({
                id: "resource.config.description.mevoco.overProvisioning.primaryStorage",
                defaultMessage: `###  Data Storage Overcommit Ratio

This parameter is used to control the allocatable space for virtual machines on the data storage. Allocatable capacity of data storage = \\[(Actual capacity - Reserved capacity) × Overcommit ratio ] - (Threshold capacity + Sum of all VM disks + Snapshots + Image cache + Migration cache)`,
              })}
            </ReactMarkdown>
          ),
        },
        {
          category: "nfsPrimaryStorage",
          name: "qcow2.allocation",
          label: intl.formatMessage({
            id: "resource.config.title.nfsPrimaryStorage.qcow2.allocation",
            defaultMessage: "Disk Preallocation Policy in NFS Storage",
          }),
          icon: "info",
          iconTooltip: (
            <ReactMarkdown>
              {intl.formatMessage({
                id: "resource.config.description.nfsPrimaryStorage.qcow2.allocation",
                defaultMessage: `### Disk Preallocation Policy in NFS Storage

Default: none. The preallocation policy for disks in a NFS data storage. Valid values: none, metedata, falloc, and full.`,
              })}
            </ReactMarkdown>
          ),
        },
      ],
      [PrimaryStorageType.LocalStorage]: [
        {
          category: "mevoco",
          name: "overProvisioning.primaryStorage",
          label: intl.formatMessage({
            id: "resource.config.title.mevoco.overProvisioning.primaryStorage",
            defaultMessage: "Data Storage Overcommit Ratio",
          }),
          icon: "info",
          iconTooltip: (
            <ReactMarkdown>
              {intl.formatMessage({
                id: "resource.config.description.mevoco.overProvisioning.primaryStorage",
                defaultMessage: `###  Data Storage Overcommit Ratio

This parameter is used to control the allocatable space for virtual machines on the data storage. Allocatable capacity of data storage = \\[(Actual capacity - Reserved capacity) × Overcommit ratio ] - (Threshold capacity + Sum of all VM disks + Snapshots + Image cache + Migration cache)`,
              })}
            </ReactMarkdown>
          ),
        },
        {
          category: "localStoragePrimaryStorage",
          name: "qcow2.allocation",
          label: intl.formatMessage({
            id: "resource.config.title.localStoragePrimaryStorage.qcow2.allocation",
            defaultMessage: "Disk Preallocation Policy",
          }),
          icon: "info",
          iconTooltip: (
            <ReactMarkdown>
              {intl.formatMessage({
                id: "resource.config.description.localStoragePrimaryStorage.qcow2.allocation",
                defaultMessage: `### Disk Preallocation Policy

Default: none. The preallocation policy for disks in a data storage. Valid values: none, metedata, falloc, and full.`,
              })}
            </ReactMarkdown>
          ),
        },
      ],
      [PrimaryStorageType.SharedBlock]: [
        {
          category: "sharedblock",
          name: "qcow2.allocation",
          label: intl.formatMessage({
            id: "resource.config.title.sharedblock.qcow2.allocation",
            defaultMessage: "Disk Preallocation Policy",
          }),
          icon: "info",
          iconTooltip: (
            <ReactMarkdown>
              {intl.formatMessage({
                id: "resource.config.description.sharedblock.qcow2.allocation",
                defaultMessage: `### Disk Preallocation Policy in SAN Storage

Default: metadata. The preallocation policy for disks in a SAN data storage. Valid values: none and metedata.`,
              })}
            </ReactMarkdown>
          ),
        },
        {
          category: "sharedblock",
          name: "device.allocate.strategy",
          label: intl.formatMessage({
            id: "resource.config.title.sharedblock.device.allocate.strategy",
            defaultMessage: "SAN Storage Allocation Policy",
          }),
          icon: "info",
          iconTooltip: (
            <ReactMarkdown>
              {intl.formatMessage({
                id: "resource.config.description.sharedblock.device.allocate.strategy",
                defaultMessage: `### SAN Storage Allocation Policy

This is used to set the placement policy for disks and snapshots on SAN storage LUNs. The default policy is sorting by drive letter. The available optional policies are: sort by drive letter, create disks on the LUN with the most remaining capacity, and create disks on the LUN with the fewest disks.`,
              })}
            </ReactMarkdown>
          ),
          selectList: [
            {
              value: "none",
              displayName: intl.formatMessage({
                id: "globalConfig.sortByDriveLetter",
                defaultMessage: "none",
              }),
            },
            {
              value: "maxFreeSize",
              displayName: intl.formatMessage({
                id: "globalConfig.maxFreeSize",
                defaultMessage: "maxFreeSize",
              }),
            },
            {
              value: "minLvCounts",
              displayName: intl.formatMessage({
                id: "globalConfig.minLvCounts",
                defaultMessage: "minLvCounts",
              }),
            },
          ],
        },
        //
        {
          category: "mevoco",
          name: "overProvisioning.primaryStorage",
          label: intl.formatMessage({
            id: "resource.config.title.mevoco.overProvisioning.primaryStorage",
            defaultMessage: "Data Storage Overcommit Ratio",
          }),
          icon: "info",
          iconTooltip: (
            <ReactMarkdown>
              {intl.formatMessage({
                id: "resource.config.description.mevoco.overProvisioning.primaryStorage",
                defaultMessage: `###  Data Storage Overcommit Ratio

This parameter is used to control the allocatable space for virtual machines on the data storage. Allocatable capacity of data storage = \\[(Actual capacity - Reserved capacity) × Overcommit ratio ] - (Threshold capacity + Sum of all VM disks + Snapshots + Image cache + Migration cache)`,
              })}
            </ReactMarkdown>
          ),
        },
      ],
      [PrimaryStorageType.Ceph]: [
        {
          category: "mevoco",
          name: "overProvisioning.primaryStorage",
          label: intl.formatMessage({
            id: "resource.config.title.mevoco.overProvisioning.primaryStorage",
            defaultMessage: "Data Storage Overcommit Ratio",
          }),
          icon: "info",
          iconTooltip: (
            <ReactMarkdown>
              {intl.formatMessage({
                id: "resource.config.description.mevoco.overProvisioning.primaryStorage",
                defaultMessage: `###  Data Storage Overcommit Ratio

This parameter is used to control the allocatable space for virtual machines on the data storage. Allocatable capacity of data storage = \\[(Actual capacity - Reserved capacity) × Overcommit ratio ] - (Threshold capacity + Sum of all VM disks + Snapshots + Image cache + Migration cache)`,
              })}
            </ReactMarkdown>
          ),
        },
      ],
    };

    return get(typeMap, detail?.type ?? -1, [
      {
        category: "mevoco",
        name: "overProvisioning.primaryStorage",
        label: intl.formatMessage({
          id: "resource.config.title.mevoco.overProvisioning.primaryStorage",
          defaultMessage: "Data Storage Overcommit Ratio",
        }),
      },
    ]);
  }, [detail?.type, intl]);

  const defaultQuery = useMemo(() => {
    const categoryList = uniq(configList?.map((item) => item.category));
    const nameList = uniq(configList?.map((item) => item.name));

    return {
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
          value: detail?.uuid,
          op: Op.eq,
        },
      ],
    };
  }, [detail?.uuid, configList]);

  const { data, refetch } = useQuery<{
    resourceConfigList: IResourceConfigList;
  }>(RESOURCE_CONFIG_LIST, {
    variables: defaultQuery,
    skip: !detail?.uuid,
  });

  const dataResourceConfigMap = useMemo(() => {
    return reduce(
      data?.resourceConfigList?.list || [],
      (obj, it) => {
        obj[`${it.category}.${it.name}`] = it;
        return obj;
      },
      {} as { [key: string]: IResourceConfigInPage },
    );
  }, [data?.resourceConfigList?.list]);

  const { list, editConfigList } = useMemo(() => {
    const _editConfigList = configList.map((it) => ({
      ...it,
      ...get(dataResourceConfigMap, [`${it.category}.${it.name}`]),
    }));

    const _list = _editConfigList.map((it) => {
      const selectList = get(it, "selectList");
      let value = get(dataResourceConfigMap, [
        `${it.category}.${it.name}`,
        "value",
      ]);

      if (!!selectList && selectList?.length > 0) {
        value = get(find(selectList, { value }), "displayName", value);
      }

      return {
        ...it,
        value:
          it?.name === "overProvisioning.primaryStorage"
            ? intl.formatMessage(
                {
                  id: "overProvisioning.primaryStorage.value",
                  defaultMessage: "{value} : 1",
                },
                { value },
              )
            : value,
      };
    });

    return {
      list: _list,
      editConfigList: _editConfigList,
    };
  }, [configList, dataResourceConfigMap, intl]);

  return {
    list,
    editConfigList,
    refetch,
  };
};
