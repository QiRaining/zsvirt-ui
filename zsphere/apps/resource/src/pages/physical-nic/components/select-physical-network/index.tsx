import { Select } from "@zstack/zsphere-components";
import { PhysicalNetworkType } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";

export interface IProps {
  placeholder?: string;
  removeOptionsKeys?: PhysicalNetworkType[];
  width?: number;
  value?: PhysicalNetworkType[];
  onChange?: (value: PhysicalNetworkType[]) => void;
}

export const usePhysicalNetworkTypeList = () => {
  const intl = useIntl();

  const physicalNetworkTypeList = React.useMemo<
    Array<{ key: PhysicalNetworkType; label: string; color: string }>
  >(
    () => [
      {
        key: PhysicalNetworkType.ManagementNetwork,
        label: intl.formatMessage({
          id: "physicalNetworkType.managementNetwork",
          defaultMessage: "Management Network",
        }),
        color: "#186EAE",
      },
      {
        key: PhysicalNetworkType.StorageNetwork,
        label: intl.formatMessage({
          id: "physicalNetworkType.storageNetwork",
          defaultMessage: "Storage Network",
        }),
        color: "#318857",
      },
      {
        key: PhysicalNetworkType.TenantNetwork,
        label: intl.formatMessage({
          id: "physicalNetworkType.tenantNetwork",
          defaultMessage: "Business Network",
        }),
        color: "#DF9900",
      },
      {
        key: PhysicalNetworkType.BackupNetwork,
        label: intl.formatMessage({
          id: "physicalNetworkType.backupNetwork",
          defaultMessage: "Backup Network",
        }),
        color: "#8A65D4",
      },
      {
        key: PhysicalNetworkType.MigrationNetwork,
        label: intl.formatMessage({
          id: "physicalNetworkType.migrationNetwork",
          defaultMessage: "Migration Network",
        }),
        color: "#D14B52",
      },
    ],
    [intl],
  );

  return physicalNetworkTypeList;
};

const SelecPhysicalNetwork: React.FC<IProps> = ({
  placeholder,
  removeOptionsKeys = [PhysicalNetworkType.ManagementNetwork],
  ...props
}) => {
  const physicalNetworkTypeList = usePhysicalNetworkTypeList();

  const options = React.useMemo(() => {
    return (
      physicalNetworkTypeList
        // .filter(it => !removeOptionsKeys.includes(it.key))
        .map((it) => ({
          label: it.label,
          value: it.key,
          color: it.color,
          disabled: removeOptionsKeys.includes(it.key),
        }))
    );
  }, [physicalNetworkTypeList, removeOptionsKeys]);

  return (
    <Select
      width="m"
      checkable
      mode="multiple"
      placeholder={placeholder}
      options={options}
      {...props}
    />
  );
};

export default SelecPhysicalNetwork;
