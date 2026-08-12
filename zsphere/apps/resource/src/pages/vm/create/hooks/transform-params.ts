import { ImageBootMode, VmCreationStrategy } from "@zstack/zsphere-types";
import type {
  CreateInstancePayload,
  Tag as ITag,
} from "@zstack/zsphere-types/graphql";
import { parseNumber } from "@zstack/zsphere-utils";
import _ from "lodash-es";

import {
  SetDiskQosType,
  bandWidthUnitList,
} from "../hardware-and-config/hardware/disk";
import { nicBandWidthList } from "../hardware-and-config/hardware/netcard/utils";

const WINDOWS_PLATFORMS = ["Windows", "WindowsVirtio"];

// interface CpuParams{

// }

// const transformCPUParams = (cpuParams:CpuParams) => {

// }

export const transformParams = (
  params: any,
  zoneUuid: string,
  realSource: any,
) => {
  const {
    name,
    count,
    group,
    runPath,

    //storePath,
    guest,
    os,
    ha,
    strategy,

    //cpu part
    totalCoreNum = 4,
    CPUMode,
    cpuResourceLevel,
    hotPlug,
    vnumaEnabled,
    cpuBindListByVCpu = [],
    sockedNum,
    cpuHideKVMMark,
    cpuQuota,

    //memory part
    memorySize = { number: 8, unit: "GB" },
    memoryResourceLevel,
    //memHotPlug 和cpu的hotplug 一样的

    //disk is volume
    //diskSize-0 = { number: 256, unit: 'GB' },
    _allocationType,
    _cacheMode,
    _aio,
    _diskIops,
    _diskSharable,

    //netcard
    _l3NetworkUuids,
    _busType,
    _mac,
    _ip,
    _securityGroup,
    _netCardBandwidth,

    // dns (linux)
    dnsAllocationType,
    dnsList,

    //cdRomList,下方处理

    //tpm
    tpmEnabled,

    //其他硬件
    gpuType,
    totalGPUMemory,
    soundCard,
    motherboardType,

    //常规选项
    tags,
    hostname,
    vmGroupList,
    biosTimeSync,
    userData,

    //远程访问
    consoleMode,
    vdiMonitorNumber,
    // antiSpoofing: { number: 4, unit: "MB" },
    spiceStreamingMode,
    consolePassword,
    usbRedirect,

    //LoginAccess
    loginType,

    //性能优化工具
    faultStrategy,
    advancedConfigGuestToolTimeSync,

    //引导选项
    bootOrders,
    bootMode: _bootMode,
    bootMenuSplashTimeout = 10,
    compatibility,
    secureBoot,

    //其他设置
    vmCpuHypervisorFeature,
    vmPortOff,
    antiSpoofing,
    haStickStragedy,
    emulateHyperV,
    migrateAutoConverge,
    hotPlugEnabled,
    emulatorPin,
    vmCpuIdVendor,
    ...rest
  } = params;

  const payload: CreateInstancePayload = {
    name,
    count,
    platform: guest,
    guestOsType: os,

    architecture: runPath?.[0]?.architecture ?? "x86_64",
    virtio: false,
    imageUuid: "",
    l3NetworkUuids: [],
    defaultL3NetworkUuid: "",

    memorySize: parseNumber(memorySize?.number, memorySize?.unit) ?? 0,
    memoryResourceLevel,
    cpuNum: totalCoreNum,
    cpuMode: CPUMode,
    hotPlug,
    cpuResourceLevel,
    cpuBindType: "structure",
    cpuQuota: Number(cpuQuota),
    vnumaEnabled,
    cpuBindListByVCpu,
    strategy: strategy
      ? VmCreationStrategy.InstantStart
      : VmCreationStrategy.CreateStopped,
    ha: ha ? "NeverStop" : "None",
    sockedNum: Number(sockedNum),
    cpuHideKVMMark: cpuHideKVMMark ? "true" : "false",

    //disk选项
    rootVolumeSystemTags: [],
    //其他硬件
    gpuType,
    soundCard,
    motherboardType,
    //常规选项
    hostname,
    biosTimeSync,
    userData,

    //远程访问
    consoleMode,
    vdiMonitorNumber: parseInt(vdiMonitorNumber, 10),
    // antiSpoofing: { number: 4, unit: "MB" },
    spiceStreamingMode,
    consolePassword,
    usbRedirect,

    //性能优化工具
    faultStrategy: faultStrategy ?? "Preserve",
    advancedConfigGuestToolTimeSync,

    //引导选项
    bootOrders: bootOrders ?? [],
    bootMode:
      _bootMode === ImageBootMode.UEFI && compatibility
        ? ImageBootMode.UEFI_WITH_CSM
        : (_bootMode ?? "Legacy"),
    secureBoot: Boolean(secureBoot),

    //其他设置
    vmCpuHypervisorFeature: vmCpuHypervisorFeature ? "true" : "false",
    vmPortOff: vmPortOff ? "true" : "false",
    antiSpoofing,
    haStickStragedy: haStickStragedy ? "true" : "false",
    emulateHyperV: emulateHyperV ? "true" : "false",
    emulatorPinning:
      emulatorPin
        ?.filter((item: string) => !item.includes("NUMA node"))
        .join(",") ?? "",
    migrateAutoConverge: migrateAutoConverge ? "true" : "false",
    vmCpuIdVendor:
      runPath?.[0]?.hostSystemInfo?.hostCpuModelName
        ?.toLowerCase()
        .includes("hygon") && vmCpuIdVendor
        ? vmCpuIdVendor
        : undefined,
    hotPlugEnabled: hotPlugEnabled ? "true" : "false",
  };

  if (tpmEnabled) {
    const keyProviderUuid: null = null;
    payload.devices = {
      ...payload.devices,
      tpm: {
        enable: true,
        keyProviderUuid,
      },
    };
  }

  if (runPath?.[0]?.architecture === "aarch64") {
    payload.bootMode = ImageBootMode.UEFI;
  }

  if (gpuType === "qxl") {
    //gpuType只有qxl可以修改
    payload.totalGPUMemory = totalGPUMemory * 1024;
  }

  if (zoneUuid && zoneUuid !== "") {
    payload.zoneUuid = zoneUuid;
  }

  if (realSource?.__typename === "HostVO") {
    payload.hostUuid = realSource?.uuid ?? "";
    payload.clusterUuid = realSource?.cluster?.uuid ?? "";
  }
  if (realSource?.__typename === "Cluster") {
    payload.hostUuid = realSource?.host?.uuid ?? "";
    payload.clusterUuid = realSource?.uuid ?? "";
  }

  if (runPath?.[0]?.__typename === "Cluster") {
    payload.hostUuid = runPath?.[0]?.host?.uuid ?? "";
    payload.clusterUuid = runPath?.[0]?.uuid ?? "";
  }

  if (runPath?.[0]?.__typename === "HostVO") {
    payload.clusterUuid = runPath?.[0]?.cluster?.uuid ?? "";
    payload.hostUuid = runPath?.[0]?.uuid ?? "";
  }

  if (realSource?.__typename === "PrimaryStorageVO") {
    payload.rootPrimaryStorageUuid = realSource?.uuid;
  }

  //根云盘部分
  const rootVolumeSystemTags = [];
  const rootDiskCreateType = params["diskCreateType-0"];
  const rootPrimaryStorage = params["storePath-0"];

  if (rootPrimaryStorage?.[0]?.uuid) {
    payload.rootPrimaryStorageUuid = rootPrimaryStorage?.[0]?.uuid;
  }

  if (rootDiskCreateType === "new") {
    payload.rootDiskSize =
      parseNumber(params[`diskSize-0`]?.number, params[`diskSize-0`]?.unit) ??
      0;
    //新建硬盘，读光驱cdrom的
    const cdImageUuid = params["cdRomList-0"]?.[0]?.uuid;
    if (cdImageUuid) {
      payload.imageUuid = cdImageUuid;
    }
    //payload.imageUuid = params['cdRomList-0']?.[0].uuid
  }

  if (rootDiskCreateType === "image") {
    //选择硬盘镜像，读硬盘镜像的
    const diskImage = params["diskImage-0"]?.[0];
    if (diskImage) {
      payload.rootDiskSize =
        parseNumber(params[`diskSize-0`]?.number, params[`diskSize-0`]?.unit) ??
        0;
    }
    if (diskImage) {
      payload.imageUuid = diskImage?.uuid;
    } else {
      const cdImageUuid = params["cdRomList-0"]?.[0]?.uuid;
      if (cdImageUuid) {
        payload.imageUuid = cdImageUuid;
      }
    }
  }

  if (rootDiskCreateType === "created") {
    const cdImageUuid = params["cdRomList-0"]?.[0]?.uuid;
    if (cdImageUuid) {
      payload.imageUuid = cdImageUuid;
    }
  }

  //  virtio 传参的处理
  if (params["busType-0"] === "virtio") {
    payload.virtio = true;
  }

  //根云盘标签部分

  //制备方式方面，指定了存储位置才传值，不指定不传(后端处理)
  if (params["allocationType-0"] && params["storePath-0"]) {
    rootVolumeSystemTags.push(
      `volumeProvisioningStrategy::${params["allocationType-0"]}`,
    );
  }
  if (params["cacheMode-0"]) {
    rootVolumeSystemTags.push(
      `resourceConfig::kvm::vm.cacheMode::${params["cacheMode-0"]}`,
    );
  }
  if (params["aio-0"]) {
    rootVolumeSystemTags.push(
      `resourceConfig::mevoco::aio.native::${params["aio-0"]}`,
    );
  }
  if (params["volumeStoragePool-0"]?.length) {
    rootVolumeSystemTags.push(
      `ceph::rootPoolName::${params["volumeStoragePool-0"]?.[0]?.poolName}`,
    );
  }
  //、
  if (["virtio-scsi", "scsi"].includes(params["busType-0"])) {
    rootVolumeSystemTags.push(`capability::${params["busType-0"]}`);
  }

  //设置根云盘qos
  if (params["turnOnQoS-0"]) {
    let qos = "qos::";
    //设IOPS
    //total
    if (params["iopsMode-0"] === SetDiskQosType.SetIopsTotal) {
      const totalIops = params["iopsTotal-0"];
      if (totalIops) {
        qos += `totalIOPS=${totalIops},`;
      }
    }
    //read write
    if (params["iopsMode-0"] === SetDiskQosType.SetIopsWR) {
      const read = params["iopsRead-0"];
      const write = params["iopsWrite-0"];
      if (read) {
        qos += `readIOPS=${read},`;
      }
      if (write) {
        qos += `writeIOPS=${write},`;
      }
    }

    //设置BandWidth
    //total
    if (params["bandwidthMode-0"] === SetDiskQosType.SetBandwidthTotal) {
      const total = parseNumber(
        Number(params["totalBandwidth-0"]?.number || 0),
        params["totalBandwidth-0"]?.unit || "",
      );
      if (total) {
        qos += `total=${total},`;
      }
    }
    //write read
    if (params["bandwidthMode-0"] === SetDiskQosType.SetBandwidthWR) {
      const read = parseNumber(
        Number(params["readBandwidth-0"]?.number || 0),
        params["readBandwidth-0"]?.unit || "",
      );
      const write = parseNumber(
        Number(params["writeBandwidth-0"]?.number || 0),
        params["writeBandwidth-0"]?.unit || "",
      );
      if (read) {
        qos += `read=${read},`;
      }
      if (write) {
        qos += `write=${write},`;
      }
    }

    if (qos !== "qos::") {
      //去掉最后一个逗号
      rootVolumeSystemTags.push(qos.slice(0, -1));
    }
  }

  if (rootVolumeSystemTags.length) {
    payload.rootVolumeSystemTags = rootVolumeSystemTags;
  }

  if (group) {
    payload.group = group.value;
  }

  //处理多个cdrom、vmNicConfig
  const cdRomList: any = [];
  const vmNicConfigList: any = [];
  const usbList: any = [];
  const dataDiskList: any = [];

  Object.keys(params).forEach((key) => {
    const _index = key.split("-").pop();

    if (key.indexOf("cdRomList") !== -1) {
      // if (params[key]?.[0]) {
      //   cdRomList.push(params[key][0])
      // } else {
      //   cdRomList.push([])
      // }

      if (!cdRomList[Number(key.split("-")[1])]) {
        cdRomList[Number(key.split("-")[1])] = {};
      }
      cdRomList[Number(key.split("-")[1])].uuid = params[key]?.[0]?.uuid;
    }

    if (key.indexOf("cdRomName") !== -1) {
      if (!cdRomList[Number(key.split("-")[1])]) {
        cdRomList[Number(key.split("-")[1])] = {};
      }
      cdRomList[Number(key.split("-")[1])].name = params[key];
    }

    //dataDisk
    const formatValue = (value: number) => {
      return (value && value.toString()) || undefined;
    };

    if (key.indexOf("diskCreateType-") !== -1) {
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].createType = params[key];
    }
    if (key.indexOf("diskImage-") !== -1) {
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].templateUuid =
        params[key]?.[0]?.uuid;
    }
    if (key.indexOf("createDisk-") !== -1) {
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].createDiskUuid =
        params[key]?.[0]?.uuid;
    }
    if (key.indexOf("RDM-") !== -1) {
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].rdmUUid = params[key]?.[0]?.uuid;
    }
    if (key.indexOf("storePath-") !== -1) {
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].primaryStorageUuid =
        params[key]?.[0]?.uuid;
    }
    if (key.indexOf("diskSize-") !== -1) {
      const diskSize = params[key];
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].diskSize =
        parseNumber(diskSize?.number, diskSize?.unit) ?? 0;
    }

    if (key.indexOf("busType-") !== -1) {
      const diskBusType = params[key];
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].busType = diskBusType;
    }
    if (key.indexOf("iopsMode-") !== -1) {
      const iopsMode = params[key];
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].iopsMode = iopsMode;
    }
    if (key.indexOf("bandwidthMode-") !== -1) {
      const bandwidthMode = params[key];
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].bandwidthMode = bandwidthMode;
    }
    if (key.indexOf("totalBandwidth-") !== -1) {
      const totalBandwidth = formatValue(
        (params[key]?.number ?? 0) *
          1024 **
            (bandWidthUnitList.findIndex((unit) => unit === params[key]?.unit) +
              2),
      );
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].totalBandwidth =
        Number(totalBandwidth);
    }
    if (key.indexOf("turnOnQoS-") !== -1) {
      const turnOnQoS = params[key];
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].turnOnQoS = turnOnQoS;
    }
    if (key.indexOf("readBandwidth-") !== -1) {
      const readBandwidth = formatValue(
        (params[key]?.number ?? 0) *
          1024 **
            (bandWidthUnitList.findIndex((unit) => unit === params[key]?.unit) +
              2),
      );
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].readBandwidth = readBandwidth;
    }
    if (key.indexOf("writeBandwidth-") !== -1) {
      const writeBandwidth = formatValue(
        (params[key]?.number ?? 0) *
          1024 **
            (bandWidthUnitList.findIndex((unit) => unit === params[key]?.unit) +
              2),
      );

      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].writeBandwidth = writeBandwidth;
    }
    if (key.indexOf("iopsTotal-") !== -1) {
      const iopsTotal = params[key];
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].iopsTotal = iopsTotal;
    }
    if (key.indexOf("iopsRead-") !== -1) {
      const iopsRead = params[key];
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].iopsRead = iopsRead;
    }
    if (key.indexOf("iopsWrite-") !== -1) {
      const iopsWrite = params[key];
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].iopsWrite = iopsWrite;
    }

    if (key.indexOf("diskSharable-") !== -1) {
      const diskShare = params[key];
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].diskSharable = diskShare;
    }

    if (key.indexOf("volumeStoragePool-") !== -1) {
      const volumeStoragePool = params[key];
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].volumeStoragePool =
        volumeStoragePool?.[0];
    }

    if (key.indexOf("allocationType-") !== -1) {
      const diskAllocationType = params[key];
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].allocationType =
        diskAllocationType;
    }
    //不确定这里做好没有
    if (key.indexOf("cacheMode-") !== -1) {
      const diskCacheMode = params[key];
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].cacheMode = diskCacheMode;
    }
    // 不确定这里做好没有
    if (key.indexOf("aio-") !== -1) {
      const diskAio = params[key];
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].aio = diskAio;
    }

    //nicConfig
    if (key.indexOf("l3NetworkUuids-") !== -1) {
      if (vmNicConfigList[Number(key.split("-")[1])]) {
        vmNicConfigList[Number(key.split("-")[1])].l3NetworkUuid =
          params[key]?.[0]?.uuid;
      } else {
        vmNicConfigList[Number(key.split("-")[1])] = {};
        vmNicConfigList[Number(key.split("-")[1])].l3NetworkUuid =
          params[key]?.[0]?.uuid;
      }
    }

    //网卡设备 sriov
    if (key.indexOf("nicDevice-") !== -1) {
      if (vmNicConfigList[Number(key.split("-")[1])]) {
        vmNicConfigList[Number(key.split("-")[1])].vfParentUuid =
          params[key]?.[0]?.uuid;
      } else {
        vmNicConfigList[Number(key.split("-")[1])] = {};
        vmNicConfigList[Number(key.split("-")[1])].vfParentUuid =
          params[key]?.[0]?.uuid;
      }
    }

    if (key.indexOf("nicType-") !== -1) {
      if (vmNicConfigList[Number(key.split("-")[1])]) {
        vmNicConfigList[Number(key.split("-")[1])].driverType = params[key];
      } else {
        vmNicConfigList[Number(key.split("-")[1])] = {};
        vmNicConfigList[Number(key.split("-")[1])].driverType = params[key];
      }
    }
    if (key.indexOf("inboundBandwidth-") !== -1) {
      const inboundBandwidth = formatValue(
        (params[key]?.number ?? 0) *
          1024 **
            (nicBandWidthList.findIndex((unit) => unit === params[key]?.unit) +
              1),
      );

      if (vmNicConfigList[Number(key.split("-")[1])]) {
        vmNicConfigList[Number(key.split("-")[1])].inboundBandwidth =
          inboundBandwidth;
      } else {
        vmNicConfigList[Number(key.split("-")[1])] = {};
        vmNicConfigList[Number(key.split("-")[1])].inboundBandwidth =
          inboundBandwidth;
      }
    }
    if (key.indexOf("netCardState-") !== -1) {
      const stateValye = params[key] ? "enable" : "disable";
      if (vmNicConfigList[Number(key.split("-")[1])]) {
        vmNicConfigList[Number(key.split("-")[1])].state = stateValye;
      } else {
        vmNicConfigList[Number(key.split("-")[1])] = {};
        vmNicConfigList[Number(key.split("-")[1])].state = stateValye;
      }
    }
    if (key.indexOf("outboundBandwidth-") !== -1) {
      const outboundBandwidth = formatValue(
        (params[key]?.number ?? 0) *
          1024 **
            (nicBandWidthList.findIndex((unit) => unit === params[key]?.unit) +
              1),
      );
      if (vmNicConfigList[Number(key.split("-")[1])]) {
        vmNicConfigList[Number(key.split("-")[1])].outboundBandwidth =
          outboundBandwidth;
      } else {
        vmNicConfigList[Number(key.split("-")[1])] = {};
        vmNicConfigList[Number(key.split("-")[1])].outboundBandwidth =
          outboundBandwidth;
      }
    }
    if (key.indexOf("securityGroup-") !== -1) {
      const securityGroupUuidList = _.compact(params[key]).map(
        (it: any) => it.uuid,
      );

      if (vmNicConfigList[Number(key.split("-")[1])]) {
        vmNicConfigList[Number(key.split("-")[1])].securityGroupList =
          securityGroupUuidList;
      } else {
        vmNicConfigList[Number(key.split("-")[1])] = {};
        vmNicConfigList[Number(key.split("-")[1])].securityGroupList =
          securityGroupUuidList;
      }
    }
    if (key.indexOf("customMac-") !== -1) {
      if (vmNicConfigList[Number(key.split("-")[1])]) {
        vmNicConfigList[Number(key.split("-")[1])].customMac = params[key];
      } else {
        vmNicConfigList[Number(key.split("-")[1])] = {};
        vmNicConfigList[Number(key.split("-")[1])].customMac = params[key];
      }
    }
    if (
      key.indexOf("gateway4-") !== -1 &&
      params[`appointIpv4-${key.split("-")[1]}`]
    ) {
      if (vmNicConfigList[Number(key.split("-")[1])]) {
        vmNicConfigList[Number(key.split("-")[1])].ipv4Gateway = params[key];
      } else {
        vmNicConfigList[Number(key.split("-")[1])] = {};
        vmNicConfigList[Number(key.split("-")[1])].ipv4Gateway = params[key];
      }
    }
    if (
      key.indexOf("gateway6-") !== -1 &&
      params[`appointIpv6-${key.split("-")[1]}`]
    ) {
      if (vmNicConfigList[Number(key.split("-")[1])]) {
        vmNicConfigList[Number(key.split("-")[1])].ipv6Gateway = params[key];
      } else {
        vmNicConfigList[Number(key.split("-")[1])] = {};
        vmNicConfigList[Number(key.split("-")[1])].ipv6Gateway = params[key];
      }
    }
    if (
      key.indexOf("ipv4-") !== -1 &&
      (params[`l3NetworkUuids-${key.split("-")[1]}`]?.[0]?.enableIPAM ||
        params[`appointIpv4-${key.split("-")[1]}`])
    ) {
      if (vmNicConfigList[Number(key.split("-")[1])]) {
        vmNicConfigList[Number(key.split("-")[1])].staticIp = params[key];
      } else {
        vmNicConfigList[Number(key.split("-")[1])] = {};
        vmNicConfigList[Number(key.split("-")[1])].staticIp = params[key];
      }
    }
    if (
      key.indexOf("ipv6-") !== -1 &&
      (params[`l3NetworkUuids-${key.split("-")[1]}`]?.[0]?.enableIPAM ||
        params[`appointIpv6-${key.split("-")[1]}`])
    ) {
      if (vmNicConfigList[Number(key.split("-")[1])]) {
        vmNicConfigList[Number(key.split("-")[1])].staticIpv6 = params[key];
      } else {
        vmNicConfigList[Number(key.split("-")[1])] = {};
        vmNicConfigList[Number(key.split("-")[1])].staticIpv6 = params[key];
      }
    }
    if (
      key.indexOf("netmask-") !== -1 &&
      params[`appointIpv4-${key.split("-")[1]}`]
    ) {
      if (vmNicConfigList[Number(key.split("-")[1])]) {
        vmNicConfigList[Number(key.split("-")[1])].ipv4Netmask = params[key];
      } else {
        vmNicConfigList[Number(key.split("-")[1])] = {};
        vmNicConfigList[Number(key.split("-")[1])].ipv4Netmask = params[key];
      }
    }
    if (
      key.indexOf("prefixLen-") !== -1 &&
      params[`appointIpv6-${key.split("-")[1]}`]
    ) {
      if (vmNicConfigList[Number(key.split("-")[1])]) {
        vmNicConfigList[Number(key.split("-")[1])].ipv6Prefix = Number(
          params[key],
        );
      } else {
        vmNicConfigList[Number(key.split("-")[1])] = {};
        vmNicConfigList[Number(key.split("-")[1])].ipv6Prefix = Number(
          params[key],
        );
      }
    }
    if (key.indexOf("nicMultiQueueNum-") !== -1) {
      if (vmNicConfigList[Number(key.split("-")[1])]) {
        vmNicConfigList[Number(key.split("-")[1])].nicMultiQueueNum = String(
          params[key],
        );
      } else {
        vmNicConfigList[Number(key.split("-")[1])] = {};
        vmNicConfigList[Number(key.split("-")[1])].nicMultiQueueNum = String(
          params[key],
        );
      }
    }
    if (guest === "Windows" && key.indexOf("dnsList4-") !== -1) {
      const idx = Number(key.split("-")[1]);
      const allocType = params[`dnsAllocationType4-${idx}`];
      const enableIPAM = params[`l3NetworkUuids-${idx}`]?.[0]?.enableIPAM;
      const appointIp = params[`appointIpv4-${idx}`];
      const windowsDnsList = params[key]?.filter((dns: any) => !!dns) ?? [];
      if (!vmNicConfigList[idx]) {
        vmNicConfigList[idx] = {};
      }
      if (
        allocType === "manual" &&
        windowsDnsList.length &&
        (enableIPAM || appointIp)
      ) {
        vmNicConfigList[idx].dnsList = windowsDnsList;
      }
    }
    if (guest === "Windows" && key.indexOf("dnsList6-") !== -1) {
      const idx = Number(key.split("-")[1]);
      const allocType = params[`dnsAllocationType6-${idx}`];
      const enableIPAM = params[`l3NetworkUuids-${idx}`]?.[0]?.enableIPAM;
      const appointIp = params[`appointIpv6-${idx}`];
      const windowsDnsList = params[key]?.filter((dns: any) => !!dns) ?? [];
      if (!vmNicConfigList[idx]) {
        vmNicConfigList[idx] = {};
      }
      if (
        allocType === "manual" &&
        windowsDnsList.length &&
        (enableIPAM || appointIp)
      ) {
        vmNicConfigList[idx].dns6List = windowsDnsList;
      }
    }

    if (
      key.indexOf("usbDiviceType-") !== -1 &&
      params[`usbDivice-${key.split("-")[1]}`]?.[0]?.uuid
    ) {
      if (!usbList[Number(key.split("-")[1])]) {
        usbList[Number(key.split("-")[1])] = {};
      }
      usbList[Number(key.split("-")[1])].attachType = params[key];
    }

    if (key.indexOf("usbDivice-") !== -1 && params[key]?.[0]?.uuid) {
      if (!usbList[Number(key.split("-")[1])]) {
        usbList[Number(key.split("-")[1])] = {};
      }
      usbList[Number(key.split("-")[1])].usbDeviceUuid = params[key]?.[0]?.uuid;
    }

    // gpu
    if (
      key.indexOf("gpuDevice-") === 0 &&
      params?.[`gpuDeviceType-${_index}`] === "gpu" &&
      params?.[key]?.length
    ) {
      payload.gpuDeviceUuidList = payload.gpuDeviceUuidList
        ? payload.gpuDeviceUuidList!.concat([params[key]?.[0]?.uuid])
        : [params[key]?.[0]?.uuid];
    }

    // pcie
    if (key.indexOf("pcieDevice-") === 0 && params?.[key]?.length) {
      payload.pcieDeviceList = payload.pcieDeviceList
        ? payload.pcieDeviceList!.concat([params[key]?.[0]?.uuid])
        : [params[key]?.[0]?.uuid];
    }
  });

  if (params[`gpuDevice-0`]?.length && params?.[`gpuDeviceType-0`] === "vgpu") {
    payload.vgpuDevice = _.pick(params[`gpuDevice-0`]?.[0], ["uuid", "type"]);
  }

  if (dataDiskList?.length > 1) {
    //去掉第一个「第一个是根盘」
    dataDiskList.shift();

    let dataDiskResult = [];
    if (dataDiskList?.length > 0) {
      // 统计需要命名的数据盘数量（排除已有盘和rdm盘）
      const namableDisks = dataDiskList.filter((d: any) =>
        _.includes(["new", "image"], d.createType),
      );
      const isMultiDisk = namableDisks.length > 1;
      let letterIndex = 0;

      dataDiskList.forEach((disk: any) => {
        if (_.includes(["new", "image"], disk.createType)) {
          // 命名规范：Data-for-{vmName} / Data-for-{vmName}-a, -b, -c...
          disk.name = isMultiDisk
            ? `Data-for-${name}-${String.fromCharCode(97 + letterIndex)}`
            : `Data-for-${name}`;
          letterIndex++;
        }
      });

      //过滤掉所有删除的
      dataDiskResult = dataDiskList
        .filter((t: any) => t.createType !== "deleted")
        .map((item: any) => {
          // let diskao = {}
          //systemTag部分
          const diskTags: any[] = [];
          //制备方式方面，指定了存储位置才传值，不指定不传(后端处理)
          if (item?.allocationType && item?.primaryStorageUuid) {
            diskTags.push(
              `volumeProvisioningStrategy::${item?.allocationType}`,
            );
          }
          //
          //

          if (
            item?.busType &&
            ["virtio-scsi", "scsi"].includes(item?.busType) &&
            guest !== "Other"
          ) {
            diskTags.push(`capability::${item?.busType}`);
          }
          if (item?.cacheMode) {
            diskTags.push(
              `resourceConfig::kvm::vm.cacheMode::${item?.cacheMode}`,
            );
          }
          if (item?.aio) {
            diskTags.push(`resourceConfig::mevoco::aio.native::${item?.aio}`);
          }
          if (item?.diskSharable) {
            diskTags.push(`ephemeral::shareable`);
          }

          if (item?.volumeStoragePool) {
            diskTags.push(`ceph::pool::${item?.volumeStoragePool?.poolName}`);
          }

          //设置根云盘qos
          if (item?.turnOnQoS) {
            let qos = "qos::";
            //设IOPS
            //total
            if (item?.iopsMode === SetDiskQosType.SetIopsTotal) {
              const totalIops = item?.iopsTotal;
              if (totalIops) {
                qos += `totalIOPS=${totalIops},`;
              }
            }
            //read write
            if (item?.iopsMode === SetDiskQosType.SetIopsWR) {
              const read = item?.iopsRead;
              const write = item?.iopsWrite;
              if (read) {
                qos += `readIOPS=${read},`;
              }
              if (write) {
                qos += `writeIOPS=${write},`;
              }
            }

            //设置BandWidth
            //total
            if (item?.bandwidthMode === SetDiskQosType.SetBandwidthTotal) {
              const totalBandwidth = item?.totalBandwidth;
              if (totalBandwidth) {
                qos += `total=${totalBandwidth},`;
              }
            }
            //write read
            if (item?.bandwidthMode === SetDiskQosType.SetBandwidthWR) {
              const readBandwidth = item?.readBandwidth;
              const writeBandwidth = item?.writeBandwidth;
              if (readBandwidth) {
                qos += `read=${readBandwidth},`;
              }
              if (writeBandwidth) {
                qos += `write=${writeBandwidth},`;
              }
            }

            if (qos !== "qos::") {
              diskTags.push(qos.slice(0, -1));
            }
          }

          //新建
          if (item.createType === "new") {
            const newResult: any = { name: item.name };
            if (item?.primaryStorageUuid) {
              newResult.primaryStorageUuid = item?.primaryStorageUuid;
            }
            if (item?.diskSize) {
              newResult.size = item.diskSize;
            }
            if (diskTags) {
              newResult.systemTags = diskTags;
            }
            return newResult;
          }

          //镜像
          if (item.createType === "image") {
            const newResult: any = { name: item.name };
            if (item?.primaryStorageUuid) {
              newResult.primaryStorageUuid = item?.primaryStorageUuid;
            }
            // if (item?.diskSize) {
            //   newResult.size = item.diskSize
            // }
            if (item?.templateUuid) {
              newResult.templateUuid = item.templateUuid;
            }
            if (diskTags) {
              newResult.systemTags = diskTags;
            }
            return newResult;
          }

          //已有
          if (item.createType === "created") {
            const newResult: any = { sourceType: "VolumeVO" };

            if (item?.createDiskUuid) {
              newResult.sourceUuid = item?.createDiskUuid;
            }
            return newResult;
          }

          //rdm
          if (item.createType === "rdm") {
            const newResult: any = { sourceType: "LunVO", systemTags: [] };

            if (item?.rdmUUid) {
              newResult.sourceUuid = item?.rdmUUid;
            }
            return newResult;
          }

          return [];
        });
    }
    if (dataDiskResult.length > 0) {
      payload.DiskAOs = dataDiskResult;
    }
  }

  //只传入有数据的部分
  const vmNicConfigListWithData = vmNicConfigList.filter(
    (t: any) => t.l3NetworkUuid,
  );
  if (
    vmNicConfigListWithData?.length !== 0 &&
    vmNicConfigListWithData?.[0]?.l3NetworkUuid
  ) {
    payload.vmNicConfig = vmNicConfigListWithData;
    payload.l3NetworkUuids = vmNicConfigListWithData.map(
      (t: any) => t.l3NetworkUuid,
    );
    payload.defaultL3NetworkUuid = vmNicConfigListWithData?.[0]?.l3NetworkUuid;

    if (guest === "Linux" && dnsAllocationType === "manual") {
      const linuxDnsList = dnsList?.filter((dns: any) => !!dns) ?? [];
      if (linuxDnsList.length) {
        vmNicConfigListWithData[0].dnsList = linuxDnsList;
      }
    }

    payload.vmNicParams = JSON.stringify(
      vmNicConfigListWithData.map((t: any) => {
        const result: any = { l3NetworkUuid: t.l3NetworkUuid };

        if (t.driverType) {
          result.driverType = t.driverType;
        }

        if (t.vfParentUuid) {
          result.vfParentUuid = t.vfParentUuid;
        }

        if (t.nicMultiQueueNum) {
          result.multiQueueNum = String(t.nicMultiQueueNum);
        } else {
          result.multiQueueNum =
            (payload.cpuNum as number) < 12 ? String(payload.cpuNum) : "12";
        }

        if (t.outboundBandwidth) {
          result.outboundBandwidth = t.outboundBandwidth;
        }

        if (t.inboundBandwidth) {
          result.inboundBandwidth = t.inboundBandwidth;
        }
        if (t.state) {
          result.state = t.state;
        }
        if (t.dnsList) {
          result.dnsList = t.dnsList;
        }
        if (t.dns6List) {
          result.dns6List = t.dns6List;
        }

        return result;
      }),
    );
  }

  // payload.cdromList = cdRomList
  //   .filter((t: any) => t.uuid)
  //   .map((t: any, index: number) => {
  //     return { cdRom: `CD-ROM-${index}`, isoUuid: t.uuid }
  //   })
  payload.cdromList = cdRomList
    .filter((t: any) => t.name !== "deleted")
    .map((t: any) => {
      return { cdRom: t.name, isoUuid: t.uuid };
    });

  const usbListWithData = usbList.filter(
    (t: any) => t.attachType !== "deleted",
  );
  if (usbListWithData?.length !== 0 && count === 1) {
    payload.vmUSBConfig = usbListWithData.map((t: any) => {
      return { attachType: t?.attachType, usbDeviceUuid: t?.usbDeviceUuid };
    });
  }

  if (vmGroupList?.length !== 0) {
    payload.vmGroupUuid = vmGroupList?.[0]?.uuid;
  }

  if (tags?.length) {
    payload.tagUuids = tags.map((t: ITag) => t.uuid);
  }

  if (loginType === "password" && rest?.rootPassword) {
    payload.rootPassword = rest?.rootPassword;
    payload.rootUsername = WINDOWS_PLATFORMS.includes(guest)
      ? "administrator"
      : "root";
  }
  if (loginType === "sshkey" && rest?.sshkey) {
    payload.sshkey = rest?.sshkey;
  }

  if (bootMenuSplashTimeout) {
    payload.bootMenuSplashTimeout = String(+bootMenuSplashTimeout * 1000);
  }

  return payload;
};
