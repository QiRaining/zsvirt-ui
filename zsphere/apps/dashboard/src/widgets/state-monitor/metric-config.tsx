import { useIntl } from "react-intl";

function useMetricConfig() {
  const intl = useIntl();

  const metricConfig: any = [
    {
      label: intl.formatMessage({
        id: "vm",
        defaultMessage: "Virtual Machine",
      }),
      value: "vmInstance",
    },
    {
      label: intl.formatMessage({
        id: "host",
        defaultMessage: "Host",
      }),
      value: "host",
      auth: {
        authKey: "stateMonitor.host",
        resource: "dashboard",
        type: "block",
      },
    },
    {
      label: intl.formatMessage({
        id: "primaryStorage",
        defaultMessage: "Data Storage",
      }),
      value: "primaryStorage",
      auth: {
        authKey: "stateMonitor.primaryStorage",
        resource: "dashboard",
        type: "block",
      },
    },
    {
      label: intl.formatMessage({
        id: "backupStorage",
        defaultMessage: "Image Storage",
      }),
      value: "backupStorage",
      auth: {
        authKey: "stateMonitor.backupStorage",
        resource: "dashboard",
        type: "block",
      },
    },
    {
      label: intl.formatMessage({
        id: "physicalGpu",
        defaultMessage: "pGPU",
      }),
      value: "physicalGpu",
      auth: {
        authKey: "stateMonitor.physicalGpu",
        resource: "dashboard",
        type: "block",
      },
    },
    {
      label: intl.formatMessage({
        id: "vgpu",
        defaultMessage: "vGPU",
      }),
      value: "virtualGpu",
      auth: {
        authKey: "stateMonitor.virtualGpu",
        resource: "dashboard",
        type: "block",
      },
    },
    {
      label: intl.formatMessage({
        id: "vpcRouter",
        defaultMessage: "VPC vRouter",
      }),
      value: "vpc",
      auth: {
        authKey: "stateMonitor.vpc",
        resource: "dashboard",
        type: "block",
      },
    },
    {
      label: intl.formatMessage({
        id: "volume",
        defaultMessage: "Disk",
      }),
      value: "volume",
    },
  ];

  return {
    metricConfig,
  };
}

export default useMetricConfig;
