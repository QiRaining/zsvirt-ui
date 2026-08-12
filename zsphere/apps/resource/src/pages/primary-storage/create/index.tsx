import type { DocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import { Op, PrimaryStorageType } from "@zstack/zsphere-types";
import type {
  CandidateSharedBlock as ICandidateSharedBlock,
  Cluster as ICluster,
  PrimaryStorageVO as IPrimaryStorage,
} from "@zstack/zsphere-types/graphql";
import { genUuid } from "@zstack/zsphere-utils";
import {
  includes,
  get,
  set,
  cloneDeep,
  forEach,
  startsWith,
  pick,
  isUndefined,
} from "lodash-es";
import React, { useContext, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import { getPrimaryStorageType } from "../utils";
import BasicConfig from "./basic-config";
import ConfigInfo from "./config-info";
import {
  PrimaryStorageResourceContext,
  PrimaryStorageTypeContext,
  SharedResourceDataContext,
} from "./contexts/storageContexts";
import { PrimaryStorageProvider } from "./providers/PrimaryStorageProvider";
import type {
  IPrimaryStorageResourceContext,
  IPrimaryStorageTypeContext,
  ISharedResourceDataContext,
} from "./type";

const createLocalStoragePrimaryStorage = gql`
  mutation createLocalStoragePrimaryStorage(
    $input: CreateLocalPrimaryStorageInput!
  ) {
    createLocalStoragePrimaryStorage(input: $input) {
      actionId
    }
  }
`;

const createNfsPrimaryStorage = gql`
  mutation createNfsPrimaryStorage($input: CreateNFSPrimaryStorageInput!) {
    createNfsPrimaryStorage(input: $input) {
      actionId
    }
  }
`;

const createSharedMountPointPrimaryStorage = gql`
  mutation createSharedMountPointPrimaryStorage(
    $input: CreateSharedMountPointPrimaryStorageInput!
  ) {
    createSharedMountPointPrimaryStorage(input: $input) {
      actionId
    }
  }
`;

const createCephPrimaryStorage = gql`
  mutation createCephPrimaryStorage($input: CreateCephPrimaryStorageInput!) {
    createCephPrimaryStorage(input: $input) {
      actionId
    }
  }
`;

const createSharedBlockGroupPrimaryStorage = gql`
  mutation createSharedBlockGroupPrimaryStorage(
    $input: CreateSharedBlockGroupPrimaryStorageInput!
  ) {
    createSharedBlockGroupPrimaryStorage(input: $input) {
      actionId
    }
  }
`;

const createBlockPrimaryStorage = gql`
  mutation createBlockPrimaryStorage($input: CreateBlockPrimaryStorageInput!) {
    createBlockPrimaryStorage(input: $input) {
      actionId
    }
  }
`;

interface MonUrl {
  sshUsername: string;
  sshPort: number;
  sshPassword: string;
  hostname: string;
}

const AddPrimaryStorageWrapper: React.FC<
  IActionWrapperProps<(IPrimaryStorage | ICluster) & { __typename: string }>
> = (props) => {
  return (
    <PrimaryStorageProvider>
      <AddPrimaryStorage {...props} />
    </PrimaryStorageProvider>
  );
};

const AddPrimaryStorage: React.FC<
  IActionWrapperProps<(IPrimaryStorage | ICluster) & { __typename: string }>
> = ({ source, visible, setVisible, selectedList }) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();

  const {
    resource,
    setResource,
    zone,
    setZone,
    initCluster,
    setInitCluster,
    setSelectedRowKeys,
    setCluster,
  } = useContext(
    PrimaryStorageResourceContext,
  ) as IPrimaryStorageResourceContext;

  const { setHostDataInTable, setDiskInfo } = useContext(
    SharedResourceDataContext,
  ) as ISharedResourceDataContext;

  const {
    primaryStorageType,
    setPrimaryStorageType,
    subPrimaryStorageType,
    setSubPrimaryStorageType,
  } = useContext(PrimaryStorageTypeContext) as IPrimaryStorageTypeContext;

  const computedResource = useMemo(
    () => source ?? selectedList?.[0] ?? {},
    [selectedList, source],
  );

  const { computedZone, computedInitCluster } = useMemo(() => {
    let _zone: any = {};
    let _cluster: any = {};

    if (computedResource?.__typename === "Zone") {
      _zone = {
        uuid: computedResource.uuid ?? -1,
        name: computedResource.name ?? -1,
      };
    } else if (computedResource?.__typename === "Cluster") {
      _zone = {
        uuid: computedResource?.zoneUuid ?? -1,
        name: computedResource?.zone?.name ?? -1,
      };

      _cluster = {
        uuid: computedResource.uuid,
        name: computedResource.name,
      };

      setCluster([_cluster]);

      form.setFields([
        {
          name: "clusterUuid",
          value: resource.uuid,
        },
      ]);

      const conditions: IQuery["conditions"] = [];
      const extraConditions: IQuery["extraConditions"] = [
        {
          key: "clusterUuid",
          op: Op.eq,
          value: resource?.uuid,
        },
      ];

      if (resource?.zoneUuid) {
        conditions.push({
          key: "zoneUuid",
          op: Op.eq,
          value: resource?.zoneUuid,
        });
      }

      if (resource?.hypervisorType) {
        extraConditions.push({
          key: "hypervisorType",
          op: Op.eq,
          value: resource?.hypervisorType,
        });
      }
    } else if (
      includes(
        ["IscsiServer", "FiberChannelStorage", "NvmeTarget", "NvmeServer"],
        computedResource?.__typename,
      )
    ) {
      if (
        (computedResource as any)?.zones &&
        (computedResource as any)?.zones?.length > 0
      ) {
        _zone = get(computedResource, ["zones", "0"], {});
      }
    }

    return {
      computedZone: _zone,
      computedInitCluster: _cluster, // 选中了某个cluster，从cluster而来
    };
  }, [computedResource, visible]);

  useEffect(() => {
    setResource(computedResource);
  }, [computedResource, setResource]);

  useEffect(() => {
    setZone(computedZone);
  }, [computedZone, setZone]);

  useEffect(() => {
    setInitCluster(computedInitCluster);
  }, [computedInitCluster, setInitCluster]);

  const initialValues = useMemo(() => {
    const _initialValues = {
      name: "",
      description: "",
      zoneUuid: "",
      type: PrimaryStorageType.SharedBlock,
      forceWipe: false,
      url: "/vms_ds",
      diskUuidList: [],
      mons: [],
      monUrls: [],
      systemTags: [],
    };

    if (visible && !!zone?.uuid) {
      set(_initialValues, "zoneUuid", zone?.uuid);
    }

    if (visible && !!initCluster?.uuid) {
      set(_initialValues, "clusterUuid", initCluster?.uuid);
    }

    return _initialValues;
  }, [visible, zone?.uuid, initCluster]);

  const onOk = async (values: any) => {
    const realPrimaryStorageType = getPrimaryStorageType(
      primaryStorageType,
      subPrimaryStorageType,
    );
    const params = cloneDeep(values);
    const {
      clusterUuid,
      diskUuidList,
      cidr,
      mountOptions,
      forceWipe,
      thinProvision,
      cephx = true,
      mons,
      token,
    } = params;
    const systemTags = [];

    const hostUuids: string[] = [];
    const blockDevicePaths: string[] = [];

    forEach(params, (value, key) => {
      if (startsWith(key, "disk-")) {
        const uuid = key.substring(5); // 去掉前缀"disk-"

        if (value?.length) {
          hostUuids.push(uuid);
          blockDevicePaths.push(value?.[0]?.name);
        }
      }
    });

    if (cidr) {
      systemTags.push(`primaryStorage::gateway::cidr::${cidr}`);
    }
    if (
      primaryStorageType === PrimaryStorageType.NFS &&
      !isUndefined(mountOptions)
    ) {
      systemTags.push(`nfs::mount::options::${mountOptions}`);
    }
    if (forceWipe) {
      systemTags.push("forceWipe");
    }
    if (thinProvision) {
      systemTags.push(
        "primaryStorageVolumeProvisioningStrategy::ThinProvisioning",
      );
    }
    if (!cephx) {
      systemTags.push("ceph::nocephx");
    }
    if (token) {
      systemTags.push(`ceph::thirdPartyPlatform::${token}`);
    }

    const monUrls: string[] = [];
    mons?.forEach((item: MonUrl) => {
      monUrls.push(
        `${item.sshUsername}:${item.sshPassword}@${item.hostname}:${item.sshPort}`,
      );
    });

    const diskUuids = diskUuidList?.map(
      (disk: ICandidateSharedBlock) => disk?.wwid,
    );

    let payload = {};

    if (includes([PrimaryStorageType.LocalStorage], realPrimaryStorageType)) {
      payload = {
        systemTags,
        clusterUuid,
        blockDevicePaths,
        hostUuids,
        ...pick(params, ["type", "name", "description", "url", "zoneUuid"]),
      };
    }

    if (
      includes(
        [PrimaryStorageType.NFS, PrimaryStorageType.SharedMountPoint],
        realPrimaryStorageType,
      )
    ) {
      payload = {
        systemTags,
        clusterUuid,
        ...pick(params, ["type", "name", "description", "url", "zoneUuid"]),
      };
    }

    if (includes([`${PrimaryStorageType.Ceph}-ZCE`], realPrimaryStorageType)) {
      payload = {
        systemTags,
        clusterUuid,
        monUrls,
        ...pick(params, [
          "type",
          "name",
          "description",
          "url",
          "zoneUuid",
          "imageCachePoolName",
        ]),
      };

      if (params?.dataVolumePoolName) {
        payload = {
          ...payload,
          dataVolumePoolName: params?.dataVolumePoolName,
          rootVolumePoolName: params?.dataVolumePoolName,
        };
      } else {
        systemTags.push(
          `ceph::customInitializationPoolName::pool-${genUuid()}`,
        );
      }
    }

    if (includes([PrimaryStorageType.SharedBlock], realPrimaryStorageType)) {
      const { storageAddMode, storageUuidMode } = params;
      let resourceUuid: string | undefined;
      if (storageAddMode === "register") {
        if (storageUuidMode === "reset") {
          systemTags.push("takeover");
        } else if (storageUuidMode === "keep") {
          const sanStorageUuid = form?.getFieldValue?.("sanStorageUuid");
          resourceUuid = sanStorageUuid;
        }
      }

      payload = {
        systemTags,
        clusterUuid,
        diskUuids,
        ...pick(params, ["type", "name", "description", "url", "zoneUuid"]),
        ...(resourceUuid && { resourceUuid }),
      };
    }

    const typeMap = new Map([
      [PrimaryStorageType.LocalStorage, createLocalStoragePrimaryStorage],
      [PrimaryStorageType.NFS, createNfsPrimaryStorage],
      [
        PrimaryStorageType.SharedMountPoint,
        createSharedMountPointPrimaryStorage,
      ],
      [PrimaryStorageType.SharedBlock, createSharedBlockGroupPrimaryStorage],
      [PrimaryStorageType.BlockStorage, createBlockPrimaryStorage],
      [`${PrimaryStorageType.Ceph}-ZCE`, createCephPrimaryStorage],
    ]);

    const mutation: DocumentNode =
      typeMap.get(realPrimaryStorageType) || createLocalStoragePrimaryStorage;

    doAction({
      mutation,
      payload,
      name: intl.formatMessage({
        id: "add.data.storage",
        defaultMessage: "Add Data Storage",
      }),
      total: 1,
      type: "PrimaryStorageVO",
    });
    setVisible(false);
    resetState();
  };

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(initialValues);
    } else if (!visible) {
      form.resetFields();
      resetState();
    }
  }, [visible, initialValues]);

  const resetState = () => {
    setPrimaryStorageType(PrimaryStorageType.SharedBlock);
    setSubPrimaryStorageType("ZCE");
    setSelectedRowKeys([]);
    setDiskInfo([]);
    setHostDataInTable([]);
  };

  return (
    <DialogForm
      form={form}
      widthClassName="w-200"
      visible={visible}
      setVisible={setVisible}
      onCancel={() => setVisible(false)}
      onOk={onOk}
      title={intl.formatMessage({
        id: "add.data.storage",
        defaultMessage: "Add Data Storage",
      })}
    >
      <Form form={form} initialValues={initialValues}>
        <BasicConfig form={form} />
        <ConfigInfo form={form} />
      </Form>
    </DialogForm>
  );
};

export default AddPrimaryStorageWrapper;
