import { useIntl } from "react-intl";

import { useVirtualizationGlobalConfig } from "../../../system-parameter/hooks/useVirtualizationGlobalConfig";

export const useGlobalConfigList = () => {
  const intl = useIntl();

  const globalConfigList = [
    {
      key: "virtualization.encrypt.enable.password.encrypt",
      license: "Basic,Standard",
      categoryType: "Basic",
      name: intl.formatMessage({
        id: "globalConfig.virtualization.encrypt.enable.password.encrypt",
        defaultMessage: "Host Password Encryption Policy",
      }),
      description: intl.formatMessage({
        id: "globalConfig.virtualization.encrypt.enable.password.encrypt.description",
        defaultMessage: `### Host Password Encryption Policy

Specifies whether and how to encrypt the login password of hosts in the database. Default: None. Options include None and LocalEncryption.

- None: Do not encrypt the login password of hosts.
- LocalEncryption: Encrypt the login password of hosts by using the encryption feature provided by the platform.`,
      }),
      firstCategory: intl.formatMessage({
        id: "virtualization.hosts.and.vms",
        defaultMessage: "Host and VM",
      }),
      firstCategoryKey: "virtualization.hosts.and.vms",
      secondCategory: intl.formatMessage({
        id: "virtualization.host",
        defaultMessage: "Host",
      }),
      secondCategoryKey: "virtualization.host",
      formItem: {
        inputType: "Select",
        unitList: [],
        selectList: [
          {
            value: "None",
            displayName: intl.formatMessage({
              id: "globalConfig.None",
              defaultMessage: "None",
            }),
          },
          {
            value: "LocalEncryption",
            displayName: intl.formatMessage({
              id: "globalConfig.LocalEncryption",
              defaultMessage: "LocalEncryption",
            }),
          },
        ],
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
