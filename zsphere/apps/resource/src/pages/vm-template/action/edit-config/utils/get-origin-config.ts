import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { formatStorageToObj } from "@zstack/zsphere-utils";

export const getOriginConfigForEditingTemplate = (
  vmData: IVM,
  resourceConfig: any,
) => {
  const {
    name,
    vmGroup = [], //调度组
    group, //虚拟机分组
    guestOsType,
    systemTag,
    vmHa,
    cpuNum: totalCoreNum,
    memorySize,
    cpuModeInfo,
    platform,
    host,
    //primaryStorage
  } = vmData;

  const {
    vmCpuPinningList, // cpu绑定
    vmPriority, // CPU资源优先级,内存资源优先级
  } = systemTag!;
  // ZSV-7867: ha 字段从 vmHa.haLevel 读取
  const ha = vmHa?.haLevel;

  const config: any = {
    name,
    group,
    vmGroup,
    ha: ha === "NeverStop",
    guest: platform,
    os: guestOsType,
    runPath: host ? [host] : [],
    //storePath: primaryStorage ? [primaryStorage] : [],
    // cpu
    totalCoreNum,
    sockedNum: systemTag?.cpuCores
      ? parseInt(systemTag.cpuCores, 10)
      : totalCoreNum,
    CPUMode: cpuModeInfo?.value ?? "None",
    cpuResourceLevel:
      ["High", "CpuHigh"].indexOf(vmPriority!) > -1 ? "CpuHigh" : "Normal",
    cpuBindListByVCpu: vmCpuPinningList?.map((cv) => ({
      vCPU: cv.vCPU,
      pCPUList: cv.pCPU?.split(","),
    })),
    hotPlug: resourceConfig?.numa?.value === "true",
    cpuHideKVMMark:
      resourceConfig?.["vm.cpu.hypervisor.feature"]?.value === "true",
    // 内存
    memoryResourceLevel:
      ["MemoryHigh", "High"].indexOf(vmPriority!) > -1 ? "High" : "Normal",
    memorySize: formatStorageToObj(memorySize!),
    memHotPlug: resourceConfig?.numa?.value === "true",
    totalGPUMemory: systemTag?.qxlMemory?.vram
      ? systemTag?.qxlMemory?.vram / 1024
      : 16,
    gpuType: resourceConfig?.videoType?.value,
    soundCard: resourceConfig?.soundType?.value,
  };

  return config;
};
