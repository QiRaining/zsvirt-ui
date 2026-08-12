import { useIntl } from "react-intl";

const [cpuUsedPercentStr] = [
  "cpuUsedPercentThreshold",
  "memoryUsedPercentThreshold",
  "cpuUsedPercentThreshold,memoryUsedPercentThreshold",
];

export const useInitialValues = () => {
  const intl = useIntl();

  return {
    name: "Cluster-1",
    architecture: "x86_64",
    automationLevel: "closed",
    monitorItem: cpuUsedPercentStr,
    thresholdDuration: {
      number: 6,
      unit: intl.formatMessage({ id: "second", defaultMessage: " seconds" }),
    },
    "drs-drs.migrateVm.concurrent": 1,
    "drs-drs.schedulingInterval": {
      number: 300,
      unit: intl.formatMessage({ id: "second", defaultMessage: " seconds" }),
    },
    "host-cpu.overProvisioning.ratio": "4",
    "mevoco-overProvisioning.memory": "1",
    checkCpuModel: false,
    // ZSV-3700,'kvm-reservedMemory' coming into the backend should be in unit
    "kvm-reservedMemory": "1G",
    cpuMode: "none",
    "kvm-vm.cpu.hypervisor.feature": true,
    "vm-videoType": "vga",
  };
};
