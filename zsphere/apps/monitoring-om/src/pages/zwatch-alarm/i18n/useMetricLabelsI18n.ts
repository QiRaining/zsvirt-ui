import { useIntl } from "react-intl";

export type MetricLabelsType = "VMUuid" | "CPUNum" | string;

export type MetricLabelsMapType = {
  [key in MetricLabelsType]: string;
};

const useMetricLabelsI18n = () => {
  const intl = useIntl();
  const metricLabelsMap: MetricLabelsMapType = {
    VMUuid: intl.formatMessage({
      id: "VMUuid",
      defaultMessage: "Virtual Machine",
    }),
    HostUuid: intl.formatMessage({
      id: "HostUuid",
      defaultMessage: "Host",
    }),
    BaremetalVMUuid: intl.formatMessage({
      id: "BaremetalVMUuid",
      defaultMessage: "Bare Metal Instance",
    }),
    Baremetal2VMUuid: intl.formatMessage({
      id: "baremetal2.instance",
      defaultMessage: "Elastic Baremetal Instance",
    }),
    CPUNum: intl.formatMessage({
      id: "CPUNum",
      defaultMessage: "CPU",
    }),
    MountPoint: intl.formatMessage({
      id: "mountPoint",
      defaultMessage: "Mount Point",
    }),
    DiskDeviceLetter: intl.formatMessage({
      id: "diskDeviceLetter",
      defaultMessage: "Disk",
    }),
    DirPath: intl.formatMessage({
      id: "zwatchAlarm.pointConfig.dirPath",
      defaultMessage: "Path",
    }),
    InterfaceName: intl.formatMessage({
      id: "InterfaceName",
      defaultMessage: "NIC",
    }),
  };

  return {
    metricLabelsMap,
  };
};

export default useMetricLabelsI18n;
