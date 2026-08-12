import { ProdInfo, UIExtendedLicenseType } from "@zstack/zsphere-types";

import { getLicenseTypeString } from "./helper";

export enum LicenseDescType {
  DisasterRecovery = "disaster-recovery",
  Baremetal = "baremetal",
  V2v = "v2v",
  Service5x8 = "service-5x8",
  Service7x24 = "service-7x24",
  Arm64 = "arm64",
  Service = "service",
  ElasticBaremetal = "elastic-baremetal",
  Hybrid = "hybrid",
  SRIOV = "sriov-ui",
  Cdp = "cdp",
  GPU = "gpu-ui",
  CloudFormation = "cloud-formation-ui",
  AutoScaling = "auto-scaling-ui",
  SmartNic = "smart-nic-ui",
  CryptoCompliance = "crypto-compliance",
  SecurityElementUi = "security-element-ui",
}

export const translateLicenseDesc = (intl: any, type: LicenseDescType) => {
  const map: {
    [K in LicenseDescType]?: string;
  } = {
    [LicenseDescType.DisasterRecovery]: intl.formatMessage({
      id: "about.introduction.disaster-recovery",
      defaultMessage:
        "Backs up VM data to backup servers online in various scenarios, such as local backup, remote backup, and hybrid cloud backup.",
    }),
    [LicenseDescType.Baremetal]: intl.formatMessage({
      id: "about.introduction.baremetal",
      defaultMessage:
        "Provides exclusive physical servers for core applications to ensure high performance and stability.",
    }),
    [LicenseDescType.V2v]: intl.formatMessage({
      id: "about.introduction.v2v",
      defaultMessage:
        "Provides V2V migration to migrate VM system and data from other virtual environments to the current platform.",
    }),
    [LicenseDescType.Service5x8]: intl.formatMessage({
      id: "about.introduction.service-5x8",
      defaultMessage: "Provides 5x8 hour after-sales technical support.",
    }),
    [LicenseDescType.Service7x24]: intl.formatMessage({
      id: "about.introduction.service-7x24",
      defaultMessage: "Provides 7x24 hour after-sales technical support.",
    }),
    [LicenseDescType.Arm64]: intl.formatMessage({
      id: "about.introduction.arm64",
      defaultMessage: "Uses the ARM64 server as a compute node to provide services.",
    }),
    [LicenseDescType.Service]: intl.formatMessage({
      id: "about.introduction.service",
      defaultMessage: "Provides 5x8 and 7x24 hour after-sales technical support.",
    }),
    [LicenseDescType.ElasticBaremetal]: intl.formatMessage({
      id: "about.introduction.elastic-baremetal",
      defaultMessage:
        "Provides both the high performance of physical servers and the elastic advantages of cloud resources, featuring minute-level delivery and high hardware compatibility.",
    }),
    [LicenseDescType.Hybrid]: intl.formatMessage({
      id: "about.introduction.hybrid",
      defaultMessage:
        "Provides all features jointly launched by Alibaba Cloud and ZStack Cloud, realizing the interconnection between the control plane and the data plane.",
    }),
    [LicenseDescType.SRIOV]: intl.formatMessage({
      id: "about.introduction.sriov",
      defaultMessage:
        "Allows you to generate VF NICs from physical NICs based on the SR-IOV specification and allocate these VF NICs to VM instances. This provides VM instances strong I/O performance comparable to that of physical NICs.",
    }),
    [LicenseDescType.GPU]: intl.formatMessage({
      id: "about.introduction.gpu",
      defaultMessage: "Allows you to passthrough a physical GPU (pGPU) to virtual machines or divide a pGPU into multiple virtual GPUs (vGPUs) and distribute the vGPUs to virtual machines. This empowers virtual machines with strong computing capabilities of physical GPUs.",
    }),

    [LicenseDescType.CloudFormation]: intl.formatMessage({
      id: "about.introduction.cloudFormation",
      defaultMessage:
        "Uses stack templates to batch deploy and configure resources and manage the lifecycle of the resources. In addition, offers designers that allow efficient orchestration of cloud resources. ",
    }),
    [LicenseDescType.AutoScaling]: intl.formatMessage({
      id: "about.introduction.autoScaling",
      defaultMessage:
        "Allows automatic scale-in or scale-out of virtual machines based on the load balancing result of application workloads, thereby improving resource utilization, lowering maintenance costs, and securing stable business operations. ",
    }),
    [LicenseDescType.SmartNic]: intl.formatMessage({
      id: "about.introduction.smartNic",
      defaultMessage:
        "Allows you to use smart NICs to free more computing powers of physical CPUs and improve network performance. In addition, allows you to divide a smart NIC into multiple vDPA NICs and distribute the vDPA NICs to virtual machines, thereby empowering the virtual machines with high I/O performance like that of smart NICs.",
    }),
    [LicenseDescType.Cdp]: intl.formatMessage({
      id: "about.introduction.cdp",
      defaultMessage:
        "Provides second-level and fine-grained continuous data protection for VM instances, ensuring that VM instances can quickly recover when a failure occurs.",
    }),
    [LicenseDescType.CryptoCompliance]: intl.formatMessage({
      id: "abort.introduction.cryptoCompliance",
      defaultMessage:
        "Provides applications with cloud security capabilities based on commercial cryptography, meeting the requirements of commercial cryptography application security assessments.",
    }),
    [LicenseDescType.SecurityElementUi]: intl.formatMessage({
      id: "abort.introduction.securityElementUi",
      defaultMessage: "Provides security, compliance, and standardized cryptographic support for your applications.",
    }),
  };

  return map?.[type];
};

export enum LicenseModuleNameType {
  ProjectManagement = "project-management",
  Vmware = "vmware",
  DisasterRecovery = "disaster-recovery",
  Baremetal = "baremetal",
  V2v = "v2v",
  Service5x8 = "service-5x8",
  Service7x24 = "service-7x24",
  Arm64 = "arm64",
  Service = "service",
  ElasticBaremetal = "elastic-baremetal",
  Hybrid = "hybrid",
  SRIOV = "sriov-ui",
  Cdp = "cdp",
  GPU = "gpu-ui",
  Billing = "billing-ui",
  CloudFormation = "cloud-formation-ui",
  AutoScaling = "auto-scaling-ui",
  SmartNic = "smart-nic-ui",
  CryptoCompliance = "crypto-compliance",
  SecurityElementUi = "security-element-ui",
  ZMigrate = "zmigrate",
}

export const translateLicenseModuleName = (
  intl: any,
  type: LicenseModuleNameType,
) => {
  const map: {
    [K in LicenseModuleNameType]?: string;
  } = {
    [LicenseModuleNameType.ProjectManagement]: intl.formatMessage({
      id: "about.module.name.project-management",
      defaultMessage: "Tenant Management",
    }),
    [LicenseModuleNameType.Vmware]: intl.formatMessage({
      id: "about.module.name.vmware",
      defaultMessage: "VMware Management",
    }),
    [LicenseModuleNameType.DisasterRecovery]: intl.formatMessage({
      id: "about.module.name.backup-management",
      defaultMessage: "Backup Management",
    }),
    [LicenseModuleNameType.Baremetal]: intl.formatMessage({
      id: "about.module.name.baremetal",
      defaultMessage: "Bare Metal Management",
    }),
    [LicenseModuleNameType.V2v]: intl.formatMessage({
      id: "about.module.name.v2v",
      defaultMessage: "Migration Service",
    }),
    [LicenseModuleNameType.Arm64]: intl.formatMessage({
      id: "about.module.name.arm64",
      defaultMessage: "ARM64 Management",
    }),
    [LicenseModuleNameType.Service]: intl.formatMessage({
      id: "about.module.name.service",
      defaultMessage: "After-Sales Service",
    }),
    [LicenseModuleNameType.Service5x8]: intl.formatMessage({
      id: "about.module.name.service-5x8",
      defaultMessage: "5x8 After-Sales Service",
    }),
    [LicenseModuleNameType.Service7x24]: intl.formatMessage({
      id: "about.module.name.service-7x24",
      defaultMessage: "7x24 After-Sales Service",
    }),
    [LicenseModuleNameType.ElasticBaremetal]: intl.formatMessage({
      id: "about.module.name.elastic-baremetal",
      defaultMessage: "Elastic Baremetal Management",
    }),
    [LicenseModuleNameType.Hybrid]: intl.formatMessage({
      id: "about.module.name.hybrid",
      defaultMessage: "Alibaba Cloud Hybrid Cloud Management",
    }),
    [LicenseModuleNameType.SRIOV]: intl.formatMessage({
      id: "about.module.name.sriov",
      defaultMessage: "SR-IOV NIC Service",
    }),
    [LicenseModuleNameType.Cdp]: intl.formatMessage({
      id: "about.module.name.cdp",
      defaultMessage: "Continuous Data Protection (CDP)",
    }),
    [LicenseDescType.GPU]: intl.formatMessage({
      id: "about.module.name.gpu",
      defaultMessage: "GPU Service",
    }),

    [LicenseDescType.CloudFormation]: intl.formatMessage({
      id: "about.module.name.cloudFormation",
      defaultMessage: "CloudFormation",
    }),
    [LicenseDescType.AutoScaling]: intl.formatMessage({
      id: "about.module.name.autoScaling",
      defaultMessage: "Auto-Scaling Service",
    }),
    [LicenseDescType.SmartNic]: intl.formatMessage({
      id: "about.module.name.smartNic",
      defaultMessage: "Smart NIC Service",
    }),
    [LicenseDescType.CryptoCompliance]: intl.formatMessage({
      id: "about.module.name.cryptoCompliance",
      defaultMessage: "Cryptography Security Compliance",
    }),
    [LicenseDescType.SecurityElementUi]: intl.formatMessage({
      id: "abort.module.name.securityElementUi",
      defaultMessage: "SE Device",
    }),
    [LicenseModuleNameType.ZMigrate]: intl.formatMessage({
      id: "about.module.name.zmigrate",
      defaultMessage: "Migration Service",
    }),
  };
  return map?.[type];
};

export interface LicenseInfo {
  licenseType: UIExtendedLicenseType;
  prodInfo?: ProdInfo;
}

export const translateLicenseType = (
  intl: any,
  licenseInfo: LicenseInfo,
  isCube?: boolean,
) => {
  const map: {
    [K in UIExtendedLicenseType | ProdInfo]?: string;
  } = {
    [UIExtendedLicenseType.Community]: intl.formatMessage({
      id: "about.community",
      defaultMessage: "Community",
    }),
    [UIExtendedLicenseType.Trial]: intl.formatMessage({
      id: "about.enterprise",
      defaultMessage: "Enterprise",
    }),
    [UIExtendedLicenseType.TrialExt]: intl.formatMessage({
      id: "about.enterprise",
      defaultMessage: "Enterprise",
    }),
    [UIExtendedLicenseType.Prepaid]: intl.formatMessage({
      id: "about.enterprise",
      defaultMessage: "Enterprise",
    }),
    [UIExtendedLicenseType.OEM]: intl.formatMessage({
      id: "about.oem",
      defaultMessage: "OEM Official",
    }),
    [UIExtendedLicenseType.Paid]: intl.formatMessage({
      id: "about.enterprise",
      defaultMessage: "Enterprise",
    }),
    [UIExtendedLicenseType.Hybrid]: intl.formatMessage({
      id: "about.Hybrid",
      defaultMessage: "Hybrid",
    }),
    [UIExtendedLicenseType.HybridTrialExt]: intl.formatMessage({
      id: "about.HybridTrialExt",
      defaultMessage: "Hybrid Trial",
    }),
    [UIExtendedLicenseType.Basic]: intl.formatMessage({
      id: "about.basic",
      defaultMessage: "Basic",
    }),
    [UIExtendedLicenseType.Standard]: intl.formatMessage({
      id: "about.standard",
      defaultMessage: "Standard",
    }),
    [ProdInfo.Enterprise]: intl.formatMessage({
      id: "about.enterprise",
      defaultMessage: "Enterprise",
    }),
    [ProdInfo.ZStack]: intl.formatMessage({
      id: "about.enterprise",
      defaultMessage: "Enterprise",
    }),
    [ProdInfo.XinChuang]: intl.formatMessage({
      id: "about.xinchuang",
      defaultMessage: " ",
    }),
    [ProdInfo.EnterpriseXinChuangCloud]: intl.formatMessage({
      id: "about.xinchuang",
      defaultMessage: " ",
    }),
    [ProdInfo.AdvancedZSV]: intl.formatMessage({
      id: "about.advanced.zsv",
      defaultMessage: "Advanced",
    }),
    [ProdInfo.ProZSV]: intl.formatMessage({
      id: "about.pro.zsv",
      defaultMessage: "ZSphere Pro",
    }),
    [ProdInfo.ProXinChuang]: intl.formatMessage({
      id: "about.pro.xinchuang.zsv",
      defaultMessage: "Enhanced",
    }),
    [ProdInfo.AdvancedXinChuangZSV]: intl.formatMessage({
      id: "about.advanced.xinchuang.zsv",
      defaultMessage: "Advanced",
    }),
    [ProdInfo.BasicZSV]: intl.formatMessage({
      id: "about.basic.zsv",
      defaultMessage: "Basic",
    }),
    [ProdInfo.BasicXinChuangZSV]: intl.formatMessage({
      id: "about.basic.xinchuang.zsv",
      defaultMessage: "Basic",
    }),
  };
  const { licenseType, prodInfo } = licenseInfo;
  if (licenseType === UIExtendedLicenseType.Community) {
    return map?.[UIExtendedLicenseType.Community];
  }
  let result = (prodInfo && map?.[prodInfo]) ?? map?.[licenseType];
  if (isCube && prodInfo) {
    result =
      intl.formatMessage({
        id: "about.hyperconverged",
        defaultMessage: "Cube ",
      }) + map?.[prodInfo];
  }
  if (
    prodInfo === ProdInfo.XinChuang ||
    prodInfo === ProdInfo.EnterpriseXinChuangCloud
  ) {
    result = intl.formatMessage({
      id: "about.xinchuang",
      defaultMessage: " ",
    });
  }
  return result;
};

export enum LicenseVersionType {
  Trial = "Trial",
  TrialExt = "TrialExt",
  Prepaid = "Prepaid",
  Paid = "Paid",
  Hybrid = "Hybrid",
  Basic = "Basic",
  Standard = "Standard",
}

export const translateLicenseVersion = (
  intl: any,
  type: LicenseVersionType,
) => {
  const map: {
    [K in LicenseVersionType]?: string;
  } = {
    [LicenseVersionType.Trial]: intl.formatMessage({
      id: "about.trial",
      defaultMessage: "Unlimited Free Trial",
    }),
    [LicenseVersionType.TrialExt]: intl.formatMessage({
      id: "about.trialext",
      defaultMessage: "Trial",
    }),
    [LicenseVersionType.Prepaid]: intl.formatMessage({
      id: "about.prepaid",
      defaultMessage: "Prepaid",
    }),
    [LicenseVersionType.Paid]: intl.formatMessage({
      id: "about.prepaid",
      defaultMessage: "Prepaid",
    }),
    [LicenseVersionType.Hybrid]: intl.formatMessage({
      id: "about.prepaid",
      defaultMessage: "Prepaid",
    }),
    [LicenseVersionType.Basic]: intl.formatMessage({
      id: "about.prepaid",
      defaultMessage: "Prepaid",
    }),
    [LicenseVersionType.Standard]: intl.formatMessage({
      id: "about.prepaid",
      defaultMessage: "Prepaid",
    }),
  };
  return map?.[type];
};

export const genLicenseName = (intl: any, licenseInfo: any) => {
  const _version = translateLicenseVersion(
    intl,
    licenseInfo.licenseType as LicenseVersionType,
  );
  const isEnterprise = getLicenseTypeString(licenseInfo) === "about.enterprise";
  const _licenseType = translateLicenseType(intl, licenseInfo, false);
  if (isEnterprise) {
    return `${_licenseType} ${_version}`;
  }
  return _licenseType;
};
