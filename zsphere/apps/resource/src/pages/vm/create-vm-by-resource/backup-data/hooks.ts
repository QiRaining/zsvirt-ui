import { CPU_COMPAT_OS_LIST } from "@zstack/virtualization-resource/src/pages/vm/create/basic-config/os";
import { getSystemTagsFromNoIPAMInput } from "@zstack/virtualization-resource/src/pages/vm/utils";
import { VmCreationStrategy } from "@zstack/zsphere-types";
import type { SecurityGroup as ISecurityGroup } from "@zstack/zsphere-types/graphql";
import { parseNumber } from "@zstack/zsphere-utils";
import _ from "lodash-es";

import {
  SetDiskQosType,
  bandWidthUnitList,
} from "./advance-card/hardware/disk";
import { nicBandWidthList } from "./advance-card/hardware/netcard";
import { TpmConfigMethodEnum } from "./advance-card/hardware/tpm";

export const transformParams = (
  params: any,
  zoneUuid: string,
  realSource: any,
) => {
  const {
    name,
    runPath,
    group,
    ha,
    guest,
    os,
    strategy,
    totalCoreNum = 4,
    memorySize = { number: 8, unit: "GB" },
    CPUMode,
    // dns (linux)
    dnsAllocationType,
    dnsList,
    tpmConfigMethod,
  } = params;

  const payload: any = {
    uuid: realSource?.uuid, //备份 uuid
    name,
    memorySize: parseNumber(memorySize?.number, memorySize?.unit) ?? 0,
    cpuNum: totalCoreNum,
    strategy: strategy
      ? VmCreationStrategy.InstantStart
      : VmCreationStrategy.CreateStopped,
    systemTags: [],
  };

  if (CPUMode) {
    payload.systemTags.push(`resourceConfig::kvm::vm.cpuMode::${CPUMode}`);
  } else if (CPU_COMPAT_OS_LIST.has(os)) {
    payload.systemTags.push("resourceConfig::kvm::vm.cpuMode::host-model");
  }

  if (group?.value && group.value !== "-2" && group.value !== "-1") {
    payload.systemTags.push(`directoryUuid::${group.value}`);
  }

  if (ha) {
    payload.systemTags.push("ha::NeverStop");
  } else {
    payload.systemTags.push("ha::None");
  }

  // 处理TPM配置方式
  if (tpmConfigMethod === TpmConfigMethodEnum.Reset) {
    payload.resetTpm = true;
  } else if (tpmConfigMethod === TpmConfigMethodEnum.Retain) {
    payload.resetTpm = false;
  }

  if (zoneUuid && zoneUuid !== "") {
    payload.zoneUuid = zoneUuid;
  }

  if (runPath?.[0]?.__typename === "Cluster") {
    if (runPath?.[0]?.host?.uuid) {
      payload.hostUuid = runPath?.[0]?.host?.uuid;
    }

    payload.clusterUuid = runPath?.[0]?.uuid ?? "";
  }

  if (["HostVO", "Host"].includes(runPath?.[0]?.__typename)) {
    payload.clusterUuid =
      runPath?.[0]?.cluster?.uuid ?? runPath?.[0]?.clusterUuid ?? "";
    payload.hostUuid = runPath?.[0]?.uuid ?? "";
  }

  //根云盘部分
  const rootVolumeSystemTags = [];
  const rootDiskCreateType = params["diskCreateType-0"];

  if (rootDiskCreateType === "new") {
    // payload.rootDiskSize =
    //   parseNumber(params[`diskSize-0`]?.number, params[`diskSize-0`]?.unit) ?? 0
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
      // payload.rootDiskSize =
      //   parseNumber(params[`diskSize-0`]?.number, params[`diskSize-0`]?.unit) ?? 0
    }
    if (diskImage) {
      // payload.imageUuid = diskImage?.uuid
    } else {
      const cdImageUuid = params["cdRomList-0"]?.[0]?.uuid;
      if (cdImageUuid) {
        // payload.imageUuid = cdImageUuid
      }
    }
  }

  if (rootDiskCreateType === "created") {
    const cdImageUuid = params["cdRomList-0"]?.[0]?.uuid;
    if (cdImageUuid) {
      // payload.imageUuid = cdImageUuid
    }
  }

  if (params["busType-0"] === "virtio") {
    // payload.virtio = true
  }

  //根云盘标签部分
  if (params["allocationType-0"]) {
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

  // rootVolumeSystemTags 不再单独传，后面合并进 diskAOs[0].systemTags

  //处理vmNicConfig
  const vmNicConfigList: any = [];
  const dataDiskList: any = [];

  Object.keys(params).forEach((key) => {
    const _index = key.split("-").pop();

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

    if (key.indexOf("volumeStoragePool-") !== -1) {
      if (!dataDiskList[Number(key.split("-")[1])]) {
        dataDiskList[Number(key.split("-")[1])] = {};
      }
      dataDiskList[Number(key.split("-")[1])].volumeStoragePool =
        params[key]?.[0];
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
  });

  const diskAOs: any[] = [];
  for (let i = 0; i < (dataDiskList?.length ?? 0); i++) {
    const disk = dataDiskList[i];
    if (!disk) {
      continue;
    }
    const sourceUuid = params[`diskUuid-${i}`];
    if (!sourceUuid) {
      continue;
    }

    const diskAO: any = { sourceUuid };
    if (disk.primaryStorageUuid) {
      diskAO.primaryStorageUuid = disk.primaryStorageUuid;
    }

    const diskTags: string[] = [];
    if (i === 0) {
      diskTags.push(...rootVolumeSystemTags);
      if (params["volumeStoragePool-0"]?.length) {
        diskTags.push(
          `ceph::rootPoolName::${params["volumeStoragePool-0"]?.[0]?.poolName}`,
        );
      }
    } else {
      if (disk.allocationType) {
        diskTags.push(`volumeProvisioningStrategy::${disk.allocationType}`);
      }
      if (disk.cacheMode) {
        diskTags.push(`resourceConfig::kvm::vm.cacheMode::${disk.cacheMode}`);
      }
      if (disk.aio) {
        diskTags.push(`resourceConfig::mevoco::aio.native::${disk.aio}`);
      }
      if (disk.volumeStoragePool?.poolName) {
        diskTags.push(`ceph::pool::${disk.volumeStoragePool.poolName}`);
      }
    }
    if (diskTags.length) {
      diskAO.systemTags = diskTags;
    }
    diskAOs.push(diskAO);
  }

  payload.diskAOs = diskAOs;

  if (dataDiskList?.length > 1) {
    //去掉第一个「第一个是根盘」
    dataDiskList.shift();

    let dataDiskResult = [];
    if (dataDiskList?.length > 0) {
      let nameIndex = 1;

      dataDiskList.forEach((disk: any) => {
        if (_.includes(["new", "image"], disk.createType)) {
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

          if (item?.allocationType) {
            diskTags.push(
              `volumeProvisioningStrategy::${item?.allocationType}`,
            );
          }
          //
          //

          if (
            item?.busType &&
            item?.busType === "virtio-scsi" &&
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
      // payload.DiskAOs = dataDiskResult
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

    vmNicConfigListWithData.forEach((t: any) => {
      const _systemTags = getSystemTagsFromNoIPAMInput(t.l3NetworkUuid, t);
      if (_systemTags) {
        payload.systemTags.push(..._systemTags);
      }

      if (t.staticIp) {
        payload.systemTags.push(`staticIp::${t.l3NetworkUuid}::${t.staticIp}`);
      }

      if (t.staticIpv6) {
        payload.systemTags.push(
          `staticIp::${t.l3NetworkUuid}::${_.replace(t.staticIpv6, "::", "--")}`,
        );
      }

      if (t.customMac) {
        payload.systemTags.push(
          `customMac::${t.l3NetworkUuid}::${t.customMac}`,
        );
      }

      if (t?.securityGroupList?.length > 0) {
        payload.systemTags.push(
          `l3::${t.l3NetworkUuid}::SecurityGroupUuids::${t.securityGroupList
            .map((sg: ISecurityGroup) => sg)
            .join(",")}`,
        );
      }
    });
    payload.vmNicParams = JSON.stringify(
      vmNicConfigListWithData.map((t: any) => {
        const result: any = { l3NetworkUuid: t.l3NetworkUuid };
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

  return payload;
};
