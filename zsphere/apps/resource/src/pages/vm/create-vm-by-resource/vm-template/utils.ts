import { getVmSpecPayload } from "@zstack/virtualization-resource/src/pages/vm-spec/components/utils";
import {
  ImageBootMode,
  VmCreationStrategy,
  VmSpecPlatform,
} from "@zstack/zsphere-types";
import type {
  CreateVMFromTemplatePayload,
  Tag as ITag,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";
import { formatStorageToObj, parseNumber } from "@zstack/zsphere-utils";
import { isArray, compact, pick, includes } from "lodash-es";

import {
  SetDiskQosType,
  bandWidthUnitList,
} from "./advance-card/hardware/disk";
import { nicBandWidthList } from "./advance-card/hardware/netcard";
import { TpmConfigMethodEnum } from "./advance-card/hardware/tpm";

export enum VmSpecType {
  none = "none",
  preset = "preset",
  manual = "manual",
}

export const formateInitValue = (realSource: any) => {
  const flag = realSource?.isTemplate;

  const basicPart = {
    vmTemplate: realSource,
    vmName: `new-vm-from-${realSource?.name}`,
    count: 1,
    group: realSource?.group,
    description: "",
    runPath: [realSource?.host],
    ha: realSource?.vmHa?.haLevel === "NeverStop",
    guest: realSource?.platform,
    os: realSource?.os,
    strategy: true,
  };

  return flag
    ? {
        ...basicPart,
        ...getCpuAndMem(realSource),
      }
    : {
        count: 1,
        description: "",
        strategy: true,
      };
};

export const getBasicInfo = (vm: any, intl: any) => {
  if (!vm) {
    return {};
  }
  const {
    name,
    description,
    tag,
    vmGroup = [], //调度组
    group, //虚拟机分组
    guestOsType,
    vmHa,
    platform,
    host,
    //primaryStorage
  } = vm;

  // ZSV-7867: ha 字段从 vmHa.haLevel 读取（已不再使用 systemTag.ha）
  const ha = vmHa?.haLevel;

  const config = {
    vmName: `${name}-${intl.formatMessage({
      id: "template",
      defaultMessage: "Template",
    })}`,
    description,
    tags: tag ?? [],
    group: {
      value: {
        value: group?.uuid,
        label:
          group?.uuid === "-2"
            ? intl.formatMessage({ id: "no.group", defaultMessage: "Default" })
            : group?.name,
      },
    },
    vmGroup,
    count: 1,
    ha: ha === "NeverStop",
    guest: platform,
    os: guestOsType,
    runPath: host ? [host] : [],
    strategy: true,
  };

  return config;
};

export const getCpuAndMem = (vm: IVM) => {
  if (!vm) {
    return {};
  }
  const {
    systemTag,
    cpuNum: totalCoreNum,
    //primaryStorage
  } = vm;

  const {
    vmCpuPinningList, // cpu绑定
    vmPriority, // CPU资源优先级,内存资源优先级
  } = systemTag!;

  const cpuPart = {
    totalCoreNum,
    sockedNum: systemTag?.cpuCores
      ? parseInt(systemTag.cpuCores, 10)
      : totalCoreNum,
    CPUMode: vm?.cpuModeInfo?.value ?? "none",
    cpuResourceLevel:
      ["High", "CpuHigh"].indexOf(vmPriority!) > -1 ? "CpuHigh" : "Normal",
    vnumaEnabled: vm?.vnuma,
    cpuBindListByVCpu: vmCpuPinningList?.map((cv) => ({
      vCPU: cv.vCPU,
      pCPUList: cv.pCPU?.split(","),
    })),
  };

  const formatList = formatStorageToObj(Number(vm?.memorySize ?? 0), 2);

  const memPart = {
    memorySize: {
      number: Math.ceil(formatList.number as number),
      unit: formatList.unit,
    },
    memoryResourceLevel:
      ["MemoryHigh", "High"].indexOf(vmPriority!) > -1 ? "High" : "Normal",
  };

  return {
    ...cpuPart,
    ...memPart,
  };
};

export const transformParams = (
  params: any,
  zoneUuid: string,
  realSource: any,
) => {
  const {
    vmName,
    description,
    count,
    group,
    runPath,
    vmTemplate,
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
    allocationType: _allocationType,
    cacheMode: _cacheMode,
    aio: _aio,
    diskIops: _diskIops,
    diskSharable: _diskSharable,

    //netcard
    l3NetworkUuids: _l3NetworkUuids,
    busType: _busType,
    mac: _mac,
    ip: _ip,
    securityGroup: _securityGroup,
    netCardBandwidth: _netCardBandwidth,

    // dns (linux)
    dnsAllocationType,
    dnsList,

    //cdRomList,下方处理

    //其他硬件
    gpuType,
    totalGPUMemory,
    soundCard,
    motherboardType,

    //常规选项
    tags,
    hostname,
    vmGroupList,
    biosTimeSync: _biosTimeSync,
    userData: _userData,

    // 虚拟机规范
    vmSpecType,
    vmSpecPreset,
    vmSpecManualConfig,

    //远程访问
    consoleMode: _consoleMode,
    vdiMonitorNumber: _vdiMonitorNumber,
    // antiSpoofing: { number: 4, unit: "MB" },
    spiceStreamingMode: _spiceStreamingMode,
    consolePassword: _consolePassword,
    usbRedirect,

    //LoginAccess
    loginType: _loginType,

    //性能优化工具
    faultStrategy: _faultStrategy,
    advancedConfigGuestToolTimeSync: _advancedConfigGuestToolTimeSync,

    //引导选项
    bootOrders: _bootOrders,
    bootMode: _bootMode,
    bootMenuSplashTimeout: _bootMenuSplashTimeout = 10,
    compatibility: _compatibility,

    //其他设置
    vmCpuHypervisorFeature,
    vmPortOff,
    antiSpoofing,
    haStickStragedy,
    emulateHyperV,
    migrateAutoConverge,
    hotPlugEnabled,
    emulatorPin,
    tpmConfigMethod,
    ...rest
  } = params;

  const payload: CreateVMFromTemplatePayload = {
    name: vmName.trim(),
    description,
    templatedVmInstanceUuid: vmTemplate?.[0]?.uuid,
    count,
    platform: guest,
    guestOsType: os,

    architecture: runPath?.[0]?.architecture ?? "x86_64",
    virtio: false,
    //imageUuid: '',
    l3NetworkUuids: [],
    defaultL3NetworkUuid: "",

    memorySize: parseNumber(memorySize?.number, memorySize?.unit) ?? 0,
    memoryResourceLevel,
    cpuNum: totalCoreNum,
    cpuMode: CPUMode,
    hotPlug,
    vnumaEnabled,
    cpuResourceLevel,
    cpuBindType: "structure",
    cpuBindListByVCpu,
    cpuQuota: Number(cpuQuota),
    strategy: strategy
      ? VmCreationStrategy.InstantStart
      : VmCreationStrategy.CreateStopped,
    ha: ha ? "NeverStop" : "None",
    sockedNum: Number(sockedNum),
    cpuHideKVMMark: cpuHideKVMMark ? "true" : "false",

    //disk选项
    //其他硬件
    gpuType,
    usbRedirect,
    soundCard,
    motherboardType,
    //常规选项
    hostname,
    // biosTimeSync,
    // userData,

    // //远程访问
    // consoleMode,
    // vdiMonitorNumber: parseInt(vdiMonitorNumber, 10),
    // // antiSpoofing: { number: 4, unit: "MB" },
    // spiceStreamingMode,
    // consolePassword,

    // //性能优化工具
    // faultStrategy: faultStrategy ?? 'Preserve',
    // advancedConfigGuestToolTimeSync,

    // //引导选项
    // bootOrders: bootOrders ?? [],
    // bootMode:
    //   _bootMode === ImageBootMode.UEFI && compatibility
    //     ? ImageBootMode.UEFI_WITH_CSM
    //     : _bootMode ?? 'Legacy',

    // //其他设置
    // vmCpuHypervisorFeature: vmCpuHypervisorFeature ? 'true' : 'false',
    // vmPortOff: vmPortOff ? 'true' : 'false',
    // antiSpoofing,
    // haStickStragedy: haStickStragedy ? 'true' : 'false',
    // emulateHyperV: emulateHyperV ? 'true' : 'false',
    // emulatorPinning:
    //   emulatorPin?.filter((item: string) => !item.includes('NUMA node')).join(',') ?? '',
    // migrateAutoConverge: migrateAutoConverge ? 'true' : 'false',
    // hotPlugEnabled: hotPlugEnabled ? 'true' : 'false'
  };

  if (runPath?.[0]?.architecture === "aarch64") {
    payload.bootMode = ImageBootMode.UEFI;
  }

  if (gpuType === "qxl") {
    //gpuType只有qxl可以修改
    payload.totalGPUMemory = totalGPUMemory * 1024;
  }

  // 处理TPM配置方式
  // 如果用户选择了配置方式，根据选择设置 resetTpm
  // 如果用户没有选择，不传 resetTpm 参数，后端会从 ResourceConfig 读取（category=kvm, name=reset.tpm.after.vm.clone）
  if (tpmConfigMethod === TpmConfigMethodEnum.Reset) {
    payload.resetTpm = true;
  } else if (tpmConfigMethod === TpmConfigMethodEnum.Retain) {
    payload.resetTpm = false;
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

  //根云盘部分
  const rootVolumeSystemTags = [];
  const _rootDiskCreateType = params["diskCreateType-0"];
  const _rootPrimaryStorage = params["storePath-0"];

  // if (rootPrimaryStorage?.[0]?.uuid) {
  //   payload.rootPrimaryStorageUuid = rootPrimaryStorage?.[0]?.uuid
  // }

  // if (rootDiskCreateType === 'new') {
  //   payload.rootDiskSize =
  //     parseNumber(params[`diskSize-0`]?.number, params[`diskSize-0`]?.unit) ?? 0
  //   //新建硬盘，读光驱cdrom的
  //   const cdImageUuid = params['cdRomList-0']?.[0]?.uuid
  //   if (cdImageUuid) {
  //     payload.imageUuid = cdImageUuid
  //   }
  //   //payload.imageUuid = params['cdRomList-0']?.[0].uuid
  // }

  // if (rootDiskCreateType === 'image') {
  //   //选择硬盘镜像，读硬盘镜像的
  //   const diskImage = params['diskImage-0']?.[0]
  //   if (diskImage) {
  //     payload.rootDiskSize =
  //       parseNumber(params[`diskSize-0`]?.number, params[`diskSize-0`]?.unit) ?? 0
  //   }
  //   if (diskImage) {
  //     payload.imageUuid = diskImage?.uuid
  //   } else {
  //     const cdImageUuid = params['cdRomList-0']?.[0]?.uuid
  //     if (cdImageUuid) {
  //       payload.imageUuid = cdImageUuid
  //     }
  //   }
  // }

  // if (rootDiskCreateType === 'created') {
  //   const cdImageUuid = params['cdRomList-0']?.[0]?.uuid
  //   if (cdImageUuid) {
  //     payload.imageUuid = cdImageUuid
  //   }
  // }

  //  virtio 传参的处理
  if (params["busType-0"] === "virtio") {
    payload.virtio = true;
  } else {
    payload.virtio = false;
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
      `ceph::rootPoolName::${params["volumeStoragePool-0"]?.[0]?.poolName || params["volumeStoragePool-0"]}`,
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

  // if (rootVolumeSystemTags.length) {
  //   payload.rootVolumeSystemTags = rootVolumeSystemTags
  // }

  if (group) {
    payload.group =
      typeof group?.value === "string" ? group.value : group.value.value;
  }

  //处理多个cdrom、vmNicConfig
  const cdRomList: any = [];
  const vmNicConfigList: any = [];
  const usbList: any = [];
  const dataDiskList: any = [];

  Object.keys(params).forEach((key) => {
    const _index = key.split("-").pop();

    if (key.indexOf("cdRomList-") !== -1) {
      const uuid = params[key]?.[0]?.uuid;
      const cdRomName = params[`cdRomName-${_index}`];
      cdRomList.push({ uuid, cdRomName });
    }

    //dataDisk
    const formatValue = (value: number) => {
      return (value && value.toString()) || undefined;
    };

    if (key.indexOf("volumeUuid-") !== -1) {
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].sourceUuid = params[key];
    }

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

      dataDiskList[Number(key.split("-")[1])].volumeStoragePool = isArray(
        volumeStoragePool,
      )
        ? volumeStoragePool?.[0]
        : volumeStoragePool;
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
      const securityGroupUuidList = compact(params[key]).map(
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
        vmNicConfigList[Number(key.split("-")[1])].nicMultiQueueNum =
          params[key];
      } else {
        vmNicConfigList[Number(key.split("-")[1])] = {};
        vmNicConfigList[Number(key.split("-")[1])].nicMultiQueueNum =
          params[key];
      }
    }
    if (guest === "Windows" && key.indexOf("dnsList4-") !== -1) {
      const idx = Number(key.split("-")[1]);
      const allocType = params[`dnsAllocationType4-${idx}`];
      const windowsDnsList = params[key]?.filter((dns: any) => !!dns) ?? [];
      if (!vmNicConfigList[idx]) {
        vmNicConfigList[idx] = {};
      }
      if (allocType === "manual" && windowsDnsList.length) {
        vmNicConfigList[idx].dnsList = windowsDnsList;
      }
    }
    if (guest === "Windows" && key.indexOf("dnsList6-") !== -1) {
      const idx = Number(key.split("-")[1]);
      const allocType = params[`dnsAllocationType6-${idx}`];
      const windowsDnsList = params[key]?.filter((dns: any) => !!dns) ?? [];
      if (!vmNicConfigList[idx]) {
        vmNicConfigList[idx] = {};
      }
      if (allocType === "manual" && windowsDnsList.length) {
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
    payload.vgpuDevice = pick(params[`gpuDevice-0`]?.[0], ["uuid", "type"]);
  }

  if (dataDiskList?.length) {
    //去掉第一个「第一个是根盘」
    // dataDiskList.shift()

    let dataDiskResult = [];
    if (dataDiskList?.length > 0) {
      let nameIndex = 1;

      dataDiskList.forEach((disk: any) => {
        if (includes(["new", "image"], disk.createType)) {
          disk.name = `${name}-${nameIndex}`;
          nameIndex++;
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
            diskTags.push(
              `ceph::pool::${item?.volumeStoragePool?.poolName || item?.volumeStoragePool}`,
            );
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
            if (item.sourceUuid) {
              newResult.sourceType = "TemplatedVmInstanceVO";
              newResult.sourceUuid = item.sourceUuid;
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
            if (item?.diskSize) {
              newResult.size = item.diskSize;
            }
            if (item.sourceUuid) {
              newResult.sourceType = "TemplatedVmInstanceVO";
              newResult.sourceUuid = item.sourceUuid;
            }

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
      payload.diskAOs = dataDiskResult;
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
          result.multiQueueNum = t.nicMultiQueueNum;
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

  payload.cdromList = cdRomList
    .filter((t: any) => t.cdRomName !== "deleted")
    .map((t: any, index: number) => {
      return { cdRom: `CD-ROM-${index}`, isoUuid: t.uuid };
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

  if (Object.values(VmSpecPlatform).includes(guest)) {
    const vmSpecPresetUuid = vmSpecPreset?.value?.[0]?.uuid;
    if (vmSpecType === VmSpecType.preset && vmSpecPresetUuid) {
      payload.vmCustomSpecification = {
        uuid: vmSpecPresetUuid,
        platform: guest,
        ...getVmSpecPayload(guest, vmSpecPreset.customConfig),
      };
    } else if (vmSpecType === VmSpecType.manual) {
      payload.vmCustomSpecification = {
        platform: guest,
        ...getVmSpecPayload(guest, vmSpecManualConfig),
      };
    }
  }

  return payload;
};
