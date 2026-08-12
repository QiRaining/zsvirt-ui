import { gql, useQuery } from "@apollo/client";
import { useAction } from "@zstack/zsphere-hooks";
import { l2NetworkType } from "@zstack/zsphere-types";
import {
  CreateClusterPayload,
  ManagementNodeArch as IManagementNodeArch,
  WizardInfo,
} from "@zstack/zsphere-types/graphql";
import { cidrPrefix2Netmask } from "@zstack/zsphere-utils";
import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

const getManagementNodeArchGql = gql`
  query getManagementNodeArch {
    getManagementNodeArch {
      architecture
    }
  }
`;

const createZone = gql`
  mutation createZone($input: CreateZoneInput!) {
    createZone(input: $input) {
      actionId
    }
  }
`;

const createCluster = gql`
  mutation createCluster($input: CreateClusterInput!) {
    createCluster(input: $input) {
      actionId
    }
  }
`;

const addKvmHost = gql`
  mutation addKvmHost($input: AddKVMHostInput!) {
    addKvmHost(input: $input) {
      actionId
    }
  }
`;

const addCephBackupStorage = gql`
  mutation addCephBackupStorage($input: AddCephBackupStorageInput!) {
    addCephBackupStorage(input: $input) {
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

const addImage = gql`
  mutation addImage($input: AddImageInput!) {
    addImage(input: $input) {
      actionId
    }
  }
`;

const CREATE_L2_NETWORK = gql`
  mutation CREATE_L2_NETWORK($input: CreateL2NetworkActionInput!) {
    createL2Network(input: $input) {
      actionId
    }
  }
`;

const createL3Network = gql`
  mutation createL3Network($input: CreateL3NetworkInput!) {
    createL3Network(input: $input) {
      actionId
    }
  }
`;

// 获取管理节点架构类型
export function useGetManagementNodeArch() {
  const {
    loading,
    data: ManagementNodeArch,
    refetch,
  } = useQuery<{
    getManagementNodeArch: IManagementNodeArch;
  }>(getManagementNodeArchGql, {
    fetchPolicy: "no-cache",
  });

  const architecture = useMemo(() => {
    return ManagementNodeArch?.getManagementNodeArch?.architecture;
  }, [ManagementNodeArch]);

  return {
    loading,
    architecture,
    getManagementNodeArch: refetch,
  };
}

export function useCreateZone() {
  const intl = useIntl();
  const doAction = useAction();

  const submit = useCallback(() => {
    const payload = {
      name: "DataCenter-1",
    };
    return doAction({
      mutation: createZone,
      payload,
      name: intl.formatMessage({
        id: "create.zone",
        defaultMessage: "New Data Center",
      }),
      total: 1,
      type: "Zone",
    });
  }, [doAction, intl]);

  return {
    submit,
  };
}

export function useCreateCluster() {
  const intl = useIntl();
  const doAction = useAction();
  const { architecture } = useGetManagementNodeArch();

  const submit = useCallback(
    (zoneUuid: string) => {
      if (!zoneUuid) return;
      const payload: CreateClusterPayload = {
        name: "Cluster-1",
        zoneUuid,
        hypervisorType: "KVM",
        architecture,
        resourceConfigList: [],
      };
      if (architecture === "aarch64") {
        payload.resourceConfigList = [
          {
            category: "vm",
            name: "videoType",
            value: "virtio",
          },
        ];
      }
      return doAction({
        mutation: createCluster,
        payload,
        name: intl.formatMessage({
          id: "create.cluster",
          defaultMessage: "New Cluster",
        }),
        total: 1,
        type: "Cluster",
      });
    },
    [architecture, doAction, intl],
  );

  return {
    submit,
  };
}

export function useAddHost() {
  const intl = useIntl();
  const doAction = useAction();

  const submit = useCallback(
    (clusterUuid: string, data?: WizardInfo) => {
      if (!data) return;
      const payload = data.hostList.map((item) => {
        const { hostname, sn, ip, username, password, port } = item;
        const name = hostname || sn;
        return {
          name,
          managementIp: ip,
          username,
          password,
          sshPort: Number(port),
          clusterUuid,
        };
      });
      console.log("[auto-init] submit hosts", {
        clusterUuid,
        total: payload.length,
        hosts: payload.map(({ name, managementIp, sshPort }) => ({
          name,
          managementIp,
          sshPort,
        })),
      });
      return doAction({
        mutation: addKvmHost,
        payload,
        name: intl.formatMessage({
          id: "add.host",
          defaultMessage: "Add Host",
        }),
        total: payload.length,
        type: "HostVO",
      });
    },
    [doAction, intl],
  );

  return {
    submit,
  };
}

export function useAddBackupStorage() {
  const intl = useIntl();
  const doAction = useAction();

  const submit = useCallback(
    (zoneUuid: string, data?: WizardInfo) => {
      if (!data) return;
      const payload: any = {
        name: "BS-1",
        zoneUuid,
      };
      const { storageInfo } = data;
      const monUrls =
        storageInfo?.monList?.map((item) => {
          const { username, password, ip, port } = item;
          const monUrl = `${username}:${password}@${ip}:${port}`;
          return monUrl;
        }) || [];
      return doAction({
        mutation: addCephBackupStorage,
        payload: {
          ...payload,
          poolName: storageInfo?.poolName,
          monUrls,
        },
        name: intl.formatMessage({
          id: "add.backupStorage",
          defaultMessage: "Add Image Storage",
        }),
        total: 1,
        type: "BackupStorage",
      });
    },
    [doAction, intl],
  );

  return {
    submit,
  };
}

export function useAddPrimaryStorage() {
  const intl = useIntl();
  const doAction = useAction();

  const submit = useCallback(
    (zoneUuid: string, clusterUuid: string, data?: WizardInfo) => {
      if (!data) return;
      const payload: any = {
        name: "PS-1",
        zoneUuid,
        clusterUuid,
      };
      const { storageInfo, storagePublicNetwork } = data;
      const poolName = storageInfo?.poolName;
      const systemTags = [];
      systemTags.push(`primaryStorage::gateway::cidr::${storagePublicNetwork}`);
      const monUrls =
        storageInfo?.monList?.map((item) => {
          const { username, password, ip, port } = item;
          const monUrl = `${username}:${password}@${ip}:${port}`;
          return monUrl;
        }) || [];
      return doAction({
        mutation: createCephPrimaryStorage,
        payload: {
          ...payload,
          monUrls,
          systemTags,
          rootVolumePoolName: poolName,
          dataVolumePoolName: poolName,
          imageCachePoolName: poolName,
        },
        name: intl.formatMessage({
          id: "add.primaryStorage",
          defaultMessage: "Add Data Storage",
        }),
        total: 1,
        type: "PrimaryStorageVO",
      });
    },
    [doAction, intl],
  );

  return {
    submit,
  };
}

export function useAddImage() {
  const intl = useIntl();
  const doAction = useAction();
  const { architecture } = useGetManagementNodeArch();

  const submit = useCallback(
    (backupStorageUuids: string[]) => {
      if (!backupStorageUuids) return;
      const payload = {
        architecture,
        backupStorageUuids,
        format: "qcow2",
        guestOsType: "Linux",
        mediaType: "RootVolumeTemplate",
        name: "Image-1",
        platform: "Linux",
        system: false,
        systemTags: ["bootMode::Legacy"],
        url: "file:///opt/zstack-dvd/zstack-image-1.4.qcow2",
        virtio: true,
      };
      return doAction({
        mutation: addImage,
        payload,
        name: intl.formatMessage({
          id: "add.image",
          defaultMessage: "Add Image",
        }),
        total: 1,
        type: "Image",
      });
    },
    [architecture, doAction, intl],
  );

  return {
    submit,
  };
}

export function useCreateL2Network() {
  const intl = useIntl();
  const doAction = useAction();

  const submit = useCallback(
    (zoneUuid: string, clusterUuid: string, data?: WizardInfo) => {
      if (!data?.tenantNetwork) return;
      const { vlan_id, bond_mode, xmit_hash_policy } = data.tenantNetwork;
      const isNoVlan = Number(vlan_id) === -1;
      const payload = {
        name: isNoVlan ? "L2NoVlanNetwork-1" : "L2VlanNetwork-1",
        zoneUuid,
        clusterUuids: [clusterUuid],
        //type: isNoVlan ? l2NetworkType.L2NoVlanNetwork : l2NetworkType.L2VlanNetwork,
        type: l2NetworkType.VirtualSwitch,
        physicalInterface: "bond1",
        vlan: isNoVlan ? undefined : Number(vlan_id),
        systemTags: [`uplink::bonding::${bond_mode}::${xmit_hash_policy}`],
        vSwitchType: "LinuxBridge",
      };
      return doAction({
        mutation: CREATE_L2_NETWORK,
        payload,
        name: intl.formatMessage({
          id: "create.l2Network",
          defaultMessage: "New Distributed Switch",
        }),
        total: 1,
        type: "L2Network",
      });
    },
    [doAction, intl],
  );

  return {
    submit,
  };
}

export function useCreateL3Network() {
  const intl = useIntl();
  const doAction = useAction();

  const submit = useCallback(
    (l2NetworkUuid: string, data?: WizardInfo) => {
      if (!data?.tenantNetwork) return;
      const { start_ip, end_ip, gateway, netmask, vlan_id } =
        data.tenantNetwork;
      const payload = {
        name: "L3FlatNetwork-1",
        l2NetworkUuid,
        type: "L3BasicNetwork",
        system: false,
        category: "Private",
        showNetworkServiceType: "Flat",
        ipVersion: 4,
        dhcpService: true,
        startIp: start_ip,
        endIp: end_ip,
        gateway,
        vlan: Number(vlan_id) === -1 ? 0 : Number(vlan_id),
        netmask: cidrPrefix2Netmask(Number(netmask)),
      };
      return doAction({
        mutation: createL3Network,
        payload,
        name: intl.formatMessage({
          id: "create.flatNetwork",
          defaultMessage: "Create Distributed Port Group",
        }),
        total: 1,
        type: "L3Network",
      });
    },
    [doAction, intl],
  );

  return {
    submit,
  };
}
