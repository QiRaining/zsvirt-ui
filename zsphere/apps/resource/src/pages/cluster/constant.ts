const hypervisorTypeList = [
  {
    label: "KVM",
    value: "KVM",
  },
  {
    label: "XDragon",
    value: "xdragon",
  },
];

const checkCpuModelList = [
  {
    label: "common.check",
    value: "true",
  },
  {
    label: "common.noCheck",
    value: "false",
  },
  {
    label: "common.useGlobalConfig",
    value: "default",
  },
];

const cpuModelList = [
  "none",
  "Hygon_Customized",
  "Dhyana",
  "EPYC",
  "EPYC-IBPB",
  "Haswell-noTSX",
  "Haswell",
  "Broadwell-noTSX",
  "Broadwell",
  "SandyBridge",
  "IvyBridge",
  "Conroe",
  "Penryn",
  "Nehalem",
  "Westmere",
  "host-model",
  "host-passthrough",
  "Opteron_G1",
  "Opteron_G2",
  "Opteron_G3",
  "Opteron_G4",
];

enum ETabType {
  "NORMAL" = "NORMAL",
  "BAREMETAL" = "BAREMETAL",
  "BAREMETAL2" = "BAREMETAL2",
}

export { hypervisorTypeList, cpuModelList, checkCpuModelList, ETabType };
