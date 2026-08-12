import { useIntl } from "react-intl";

import { useVirtualizationGlobalConfig } from "../../../system-parameter/hooks/useVirtualizationGlobalConfig";

export const useGlobalConfigList = () => {
  const intl = useIntl();

  const globalConfigList = [
    {
      key: "virtualization.mevoco.vm.console.password.strength.check.config",
      categoryType: "Advanced",
      name: intl.formatMessage({
        id: "globalConfig.virtualization.mevoco.vm.console.password.strength.check.config",
        defaultMessage: "VNC Console Password",
      }),
      description: intl.formatMessage({
        id: "globalConfig.virtualization.mevoco.vm.console.password.strength.check.config.description",
        defaultMessage: `### VNC Console Password

Specify whether to require a password for VNC console login. Default: false. If enabled, you can specify the length range for the VNC console password. The default range is 6-8 characters. Additionally, you can enforce the use of a combination of digits, letters, and special characters.`,
      }),
      firstCategory: intl.formatMessage({
        id: "virtualization.hosts.and.vms",
        defaultMessage: "Host and VM",
      }),
      firstCategoryKey: "virtualization.hosts.and.vms",
      secondCategory: intl.formatMessage({
        id: "virtualization.vm",
        defaultMessage: "Virtual Machine",
      }),
      secondCategoryKey: "virtualization.vm",
      alertMessage: intl.formatMessage({
        id: "globalConfig.virtualization.mevoco.vm.console.password.strength.check.config.alert",
        defaultMessage: `If enabled, the password length format is m-n, where m and n are integers ranging from 6 to 8.`,
      }),
      formItem: {
        translateValue: "translateVNCConsolePasswordCheckConfig",
        inputType: "VNCCheckConfig",
        unitList: [],
        selectList: [],
      },
    },
    {
      key: "virtualization.ui.novnc.resource.permission.check",
      categoryType: "Advanced",
      name: intl.formatMessage({
        id: "globalConfig.ui.novnc.resource.permission.check",
        defaultMessage: "VNC Console Secondary Authentication",
      }),
      description: intl.formatMessage({
        id: "globalConfig.ui.novnc.resource.permission.check.description",
        defaultMessage:
          "### VNC Console Secondary Authentication\n\nDefault: disabled. Specifies whether a second authentication is required when you access a VM VNC console via URL.\n\nWhen enabled, the platform requires extra authentication for external VNC access, providing enhanced security.",
      }),
      firstCategory: intl.formatMessage({
        id: "virtualization.hosts.and.vms",
        defaultMessage: "Host and VM",
      }),
      firstCategoryKey: "virtualization.hosts.and.vms",
      secondCategory: intl.formatMessage({
        id: "virtualization.vm",
        defaultMessage: "Virtual Machine",
      }),
      secondCategoryKey: "virtualization.vm",
      formItem: {
        translateValue: "translateTrueAndFalse",
        inputType: "Switch",
        unitList: [],
        selectList: [],
      },
    },
    {
      key: "virtualization.mevoco.vm.password.strength.check.config",
      categoryType: "Advanced",
      name: intl.formatMessage({
        id: "globalConfig.virtualization.mevoco.vm.password.strength.check.config",
        defaultMessage: "VM Password Strength",
      }),
      description: intl.formatMessage({
        id: "globalConfig.virtualization.mevoco.vm.password.strength.check.config.description",
        defaultMessage: `### VM Password Strength

Specify whether to require login passwords for virtual machines. Default: false.

Note:

1. The VM password format is m-n, with values ranging from 8 to 32 integers. Default: 8 to 18. The password supports a combination of digits, letters, and special characters.
2. Before you set a login password for a virtual machine, make sure that cloud-init is installed in the VM system image. We recommend that the version of cloud-init be 0.7.9, 17.1, 19.4, 19.4, or later.`,
      }),
      firstCategory: intl.formatMessage({
        id: "virtualization.hosts.and.vms",
        defaultMessage: "Host and VM",
      }),
      firstCategoryKey: "virtualization.hosts.and.vms",
      secondCategory: intl.formatMessage({
        id: "virtualization.vm",
        defaultMessage: "Virtual Machine",
      }),
      secondCategoryKey: "virtualization.vm",
      alertMessage: intl.formatMessage({
        id: "globalConfig.virtualization.mevoco.vm.password.strength.check.config.alert",
        defaultMessage: `If enabled: 1. The VM password format is m-n, with values ranging from 8 to 32 integers. 2. Before you set a login password for a virtual machine, make sure that cloud-init is installed in the VM system image. We recommend that the version of cloud-init be 0.7.9, 17.1, 19.4, 19.4, or later.`,
      }),
      formItem: {
        translateValue: "translateVmPasswordCheckConfig",
        inputType: "VmPasswordCheckConfig",
        unitList: [],
        selectList: [],
      },
    },
  ];

  const { allGlobalConfig, globalConfigValueMap } =
    useVirtualizationGlobalConfig(globalConfigList);

  return {
    allGlobalConfig,
    globalConfigValueMap,
  };
};
