import type {
  CloneVmInstancePayload,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";
import { compact, keys } from "lodash-es";

import { TpmConfigMethodEnum } from "../../create-vm-by-resource/vm-template/advance-card/hardware/tpm";

export enum CloneTypeEnum {
  FullClone = "FullClone",
  FastFullClone = "FastFullClone",
}

export const getCloneInitialValues = (
  sourceVm: IVM | undefined,
  intl: any,
) => ({
  sourceVmName: sourceVm?.name ?? "",
  cloneType: CloneTypeEnum.FullClone,
  name: `${sourceVm?.name ?? ""}-${intl.locale === "en-US" ? "clone" : "克隆"}`,
  count: 1,
  strategy: false,
  vmGroupList: [],
  hostname: "",
  tpmConfigMethod: TpmConfigMethodEnum.Retain,
});

const formatValue = (value: number) => (value && value.toString()) || undefined;

const nicBandWidthUnits = ["Kbps", "Mbps", "Gbps"];

const toBandwidthValue = (value: any) =>
  formatValue(
    (value?.number ?? 0) *
      1024 ** (nicBandWidthUnits.findIndex((unit) => unit === value?.unit) + 1),
  );

const collectVmNicConfig = (values: any, guest?: string) => {
  const vmNicConfigList: any[] = [];

  keys(values).forEach((key) => {
    const dashIndex = key.indexOf("-");
    if (dashIndex < 0) {
      return;
    }
    const prefix = key.slice(0, dashIndex + 1);
    const index = Number(key.slice(dashIndex + 1));
    if (!Number.isInteger(index)) {
      return;
    }

    if (prefix === "l3NetworkUuids-") {
      vmNicConfigList[index] = {
        ...vmNicConfigList[index],
        l3NetworkUuid: values[key]?.[0]?.uuid,
      };
    }
    if (prefix === "nicDevice-") {
      vmNicConfigList[index] = {
        ...vmNicConfigList[index],
        vfParentUuid: values[key]?.[0]?.uuid,
      };
    }
    if (prefix === "nicType-") {
      vmNicConfigList[index] = {
        ...vmNicConfigList[index],
        driverType: values[key],
      };
    }
    if (prefix === "netCardState-") {
      vmNicConfigList[index] = {
        ...vmNicConfigList[index],
        state: values[key] ? "enable" : "disable",
      };
    }
    if (prefix === "customMac-" && values[key]) {
      vmNicConfigList[index] = {
        ...vmNicConfigList[index],
        customMac: values[key],
      };
    }
    if (prefix === "securityGroup-") {
      vmNicConfigList[index] = {
        ...vmNicConfigList[index],
        securityGroupList: compact(values[key]).map((it: any) => it.uuid),
      };
    }
    if (prefix === "outboundBandwidth-") {
      vmNicConfigList[index] = {
        ...vmNicConfigList[index],
        outboundBandwidth: toBandwidthValue(values[key]),
      };
    }
    if (prefix === "inboundBandwidth-") {
      vmNicConfigList[index] = {
        ...vmNicConfigList[index],
        inboundBandwidth: toBandwidthValue(values[key]),
      };
    }
    if (prefix === "gateway4-" && values[`appointIpv4-${index}`]) {
      vmNicConfigList[index] = {
        ...vmNicConfigList[index],
        ipv4Gateway: values[key],
      };
    }
    if (prefix === "gateway6-" && values[`appointIpv6-${index}`]) {
      vmNicConfigList[index] = {
        ...vmNicConfigList[index],
        ipv6Gateway: values[key],
      };
    }
    if (
      prefix === "ipv4-" &&
      (values[`l3NetworkUuids-${index}`]?.[0]?.enableIPAM ||
        values[`appointIpv4-${index}`])
    ) {
      vmNicConfigList[index] = {
        ...vmNicConfigList[index],
        staticIp: values[key],
      };
    }
    if (
      prefix === "ipv6-" &&
      (values[`l3NetworkUuids-${index}`]?.[0]?.enableIPAM ||
        values[`appointIpv6-${index}`])
    ) {
      vmNicConfigList[index] = {
        ...vmNicConfigList[index],
        staticIpv6: values[key],
      };
    }
    if (prefix === "netmask-" && values[`appointIpv4-${index}`]) {
      vmNicConfigList[index] = {
        ...vmNicConfigList[index],
        ipv4Netmask: values[key],
      };
    }
    if (prefix === "prefixLen-" && values[`appointIpv6-${index}`]) {
      vmNicConfigList[index] = {
        ...vmNicConfigList[index],
        ipv6Prefix: Number(values[key]),
      };
    }
    if (prefix === "nicMultiQueueNum-") {
      vmNicConfigList[index] = {
        ...vmNicConfigList[index],
        nicMultiQueueNum: values[key],
      };
    }
    if (guest === "Windows" && prefix === "dnsList4-") {
      const windowsDnsList = values[key]?.filter((dns: any) => !!dns) ?? [];
      if (
        values[`dnsAllocationType4-${index}`] === "manual" &&
        windowsDnsList.length
      ) {
        vmNicConfigList[index] = {
          ...vmNicConfigList[index],
          dnsList: windowsDnsList,
        };
      }
    }
    if (guest === "Windows" && prefix === "dnsList6-") {
      const windowsDnsList = values[key]?.filter((dns: any) => !!dns) ?? [];
      if (
        values[`dnsAllocationType6-${index}`] === "manual" &&
        windowsDnsList.length
      ) {
        vmNicConfigList[index] = {
          ...vmNicConfigList[index],
          dns6List: windowsDnsList,
        };
      }
    }
  });

  const vmNicConfigListWithData = vmNicConfigList.filter(
    (item) => item?.l3NetworkUuid,
  );

  if (guest === "Linux" && values.dnsAllocationType === "manual") {
    const linuxDnsList = values.dnsList?.filter((dns: any) => !!dns) ?? [];
    if (linuxDnsList.length && vmNicConfigListWithData[0]) {
      vmNicConfigListWithData[0].dnsList = linuxDnsList;
    }
  }

  return vmNicConfigListWithData;
};

const buildVmNicParams = (vmNicConfigList: any[], cpuNum?: number) =>
  JSON.stringify(
    vmNicConfigList.map((item, index) => {
      const result: Record<string, any> = {
        l3NetworkUuid: item.l3NetworkUuid,
      };

      if (vmNicConfigList.length > 1 && index === 0) {
        result.isDefaultNic = true;
      }

      if (item.driverType) {
        result.driverType = item.driverType;
      }

      if (item.vfParentUuid) {
        result.vfParentUuid = item.vfParentUuid;
      }

      if (item.nicMultiQueueNum) {
        result.multiQueueNum = String(item.nicMultiQueueNum);
      } else {
        result.multiQueueNum = (cpuNum ?? 1) < 12 ? String(cpuNum ?? 1) : "12";
      }

      if (item.outboundBandwidth) {
        result.outboundBandwidth = item.outboundBandwidth;
      }

      if (item.inboundBandwidth) {
        result.inboundBandwidth = item.inboundBandwidth;
      }

      if (item.state) {
        result.state = item.state;
      }

      if (item.dnsList) {
        result.dnsList = item.dnsList;
      }

      if (item.dns6List) {
        result.dns6List = item.dns6List;
      }

      return result;
    }),
  );

const collectDiskConfig = (values: any, payload: CloneVmInstancePayload) => {
  const rootStorage = values["storePath-0"]?.[0];
  const dataStorage = values["storePath-1"]?.[0] ?? rootStorage;

  if (rootStorage?.uuid) {
    payload.primaryStorageUuidForRootVolume = rootStorage.uuid;
  }
  if (dataStorage?.uuid) {
    payload.primaryStorageUuidForDataVolume = dataStorage.uuid;
  }

  const rootVolumeSystemTags: string[] = [];
  const dataVolumeSystemTags: string[] = [];

  const appendDiskTags = (index: number, tags: string[]) => {
    const storage = values[`storePath-${index}`]?.[0];
    if (values[`allocationType-${index}`] && storage?.uuid) {
      tags.push(
        `volumeProvisioningStrategy::${values[`allocationType-${index}`]}`,
      );
    }
  };

  appendDiskTags(0, rootVolumeSystemTags);
  appendDiskTags(1, dataVolumeSystemTags);

  payload.rootVolumeSystemTags = rootVolumeSystemTags;
  payload.dataVolumeSystemTags = dataVolumeSystemTags;
};

export const buildCloneVmPayload = ({
  values,
  sourceVm,
  cloneType,
}: {
  values: any;
  sourceVm?: IVM;
  cloneType: CloneTypeEnum;
}) => {
  const payload: CloneVmInstancePayload & Record<string, any> = {
    name: values.name,
    vmInstanceUuid: sourceVm?.uuid ?? "",
    count: values.count,
    full: true,
    strategy: values.strategy ? "InstantStart" : "CreateStopped",
    systemTags: [],
    rootVolumeSystemTags: [],
    dataVolumeSystemTags: [],
  };

  if (cloneType === CloneTypeEnum.FastFullClone) {
    payload.systemTags?.push("ephemeral::volume::fastCreate");
    payload.systemTags?.push("ephemeral::volume::flatten");
  } else {
    collectDiskConfig(values, payload);
  }

  const vmGroupUuid = values.vmGroupList?.[0]?.uuid;
  if (vmGroupUuid) {
    payload.systemTags?.push(`vmSchedulingRuleGroupUuid::${vmGroupUuid}`);
  }

  if (values.hostname) {
    payload.hostname = values.hostname;
  }

  if ((sourceVm as any)?.tpmList?.length && values.tpmConfigMethod) {
    payload.resetTpm = values.tpmConfigMethod === TpmConfigMethodEnum.Reset;
  }

  const vmNicConfig = collectVmNicConfig(values, sourceVm?.platform);
  if (vmNicConfig.length) {
    payload.vmNicConfig = vmNicConfig;
    payload.l3NetworkUuids = vmNicConfig.map((item) => item.l3NetworkUuid);
    payload.defaultL3NetworkUuid = vmNicConfig[0]?.l3NetworkUuid;
    payload.vmNicParams = buildVmNicParams(vmNicConfig, sourceVm?.cpuNum);
  }

  return payload;
};
