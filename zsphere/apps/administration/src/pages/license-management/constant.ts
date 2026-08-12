const addon_licenses_sort_temple = [
  "baremetal",
  "arm64",
  "disaster-recovery",
  "v2v",
  "zmigrate",
  "hybrid",
  "sriov-ui",
  "cdp",
  "gpu-ui",
  "cloud-formation-ui",
  "auto-scaling-ui",
  "smart-nic-ui",
  "crypto-compliance",
  "security-element-ui",
];

const addon_licenses_temple = {
  vmware: {
    disable: true,
    licenseType: "AddOn",
    modules: ["vmware"],
  },
  "disaster-recovery": {
    disable: true,
    licenseType: "AddOn",
    modules: ["disaster-recovery"],
  },
  baremetal: {
    disable: true,
    licenseType: "AddOn",
    modules: ["baremetal"],
  },
  arm64: {
    disable: true,
    licenseType: "AddOn",
    modules: ["arm64"],
  },
  v2v: {
    disable: true,
    licenseType: "AddOn",
    modules: ["v2v"],
  },
  zmigrate: {
    disable: true,
    licenseType: "AddOn",
    modules: ["zmigrate"],
  },
  hybrid: {
    disable: true,
    licenseType: "AddOn",
    modules: ["hybrid"],
  },
  "sriov-ui": {
    disable: true,
    licenseType: "AddOn",
    modules: ["sriov-ui"],
  },
  "gpu-ui": {
    disable: true,
    licenseType: "AddOn",
    modules: ["gpu-ui"],
  },
  "cloud-formation-ui": {
    disable: true,
    licenseType: "AddOn",
    modules: ["cloud-formation-ui"],
  },
  "auto-scaling-ui": {
    disable: true,
    licenseType: "AddOn",
    modules: ["auto-scaling-ui"],
  },
  "smart-nic-ui": {
    disable: true,
    licenseType: "AddOn",
    modules: ["smart-nic-ui"],
  },
  cdp: {
    disable: true,
    licenseType: "AddOn",
    modules: ["cdp"],
  },
  "crypto-compliance": {
    disable: true,
    licenseType: "AddOn",
    module: ["crypto-compliance"],
  },
  "security-element-ui": {
    disable: true,
    licenseType: "AddOn",
    modules: ["security-element-ui"],
  },
};

const addon_licenses = [
  {
    disable: true,
    licenseType: "AddOn",
    modules: ["vmware"],
  },
  {
    disable: true,
    licenseType: "AddOn",
    modules: ["disaster-recovery"],
    icon: "backup",
  },
  {
    disable: true,
    licenseType: "AddOn",
    modules: ["baremetal"],
    icon: "server-2",
  },
  {
    disable: true,
    licenseType: "AddOn",
    modules: ["project-management"],
  },
  {
    disable: true,
    licenseType: "AddOn",
    modules: ["arm64"],
  },
  {
    disable: true,
    licenseType: "AddOn",
    modules: ["v2v"],
  },
  {
    disable: true,
    licenseType: "AddOn",
    modules: ["zmigrate"],
    icon: "migrate",
  },
  {
    disable: true,
    licenseType: "AddOn",
    modules: ["elastic-baremetal"],
  },
  {
    disable: true,
    licenseType: "AddOn",
    modules: ["hybrid"],
  },
  {
    disable: true,
    licenseType: "AddOn",
    modules: ["sriov-ui"],
  },
  {
    disable: true,
    licenseType: "AddOn",
    modules: ["gpu-ui"],
  },
  {
    disable: true,
    licenseType: "AddOn",
    modules: ["cloud-formation-ui"],
  },
  {
    disable: true,
    licenseType: "AddOn",
    modules: ["auto-scaling-ui"],
  },
  {
    disable: true,
    licenseType: "AddOn",
    modules: ["smart-nic-ui"],
  },
  {
    disable: true,
    licenseType: "AddOn",
    modules: ["cdp"],
  },
  {
    disable: true,
    licenseType: "AddOn",
    modules: ["crypto-compliance"],
  },
  {
    disable: true,
    licenseType: "AddOn",
    modules: ["security-element-ui"],
  },
];

const CONSTANT = {
  addon_licenses_temple,
  addon_licenses_sort_temple,
  addon_licenses,
};

export default CONSTANT;
