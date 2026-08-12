import { useIntl } from "react-intl";

export default () => {
  const intl = useIntl();
  return [
    {
      key: "ha.allow.slibing.cross.clusters",
      license: "Community",
      categoryType: "HA",
      name: intl.formatMessage({
        id: "globalConfig.ha.allow.slibing.cross.clusters",
        defaultMessage: "VM Cross-Cluster HA ",
      }),
      description: intl.formatMessage({
        id: "globalConfig.ha.allow.slibing.cross.clusters.description",
        defaultMessage: `Specifies whether to enable VM migration across clusters to achieve high availability. Default: false. If set to true, hosts across clusters can be detected to achieve VM high availability. Before you enable this feature, make sure that clusters are well connected.`,
      }),
      firstCategory: intl.formatMessage({
        id: "platform.strategy",
        defaultMessage: "Platform Policy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "high.availability.strategy",
        defaultMessage: "HA Policy",
      }),
      secondCategoryKey: "high.availability.strategy",
      formItem: {
        inputType: "Switch",
        unitList: [],
        selectList: [],
      },
    },
    {
      key: "ha.host.check.maxAttempts",
      license: "Community",
      categoryType: "HA",
      name: intl.formatMessage({
        id: "globalConfig.ha.host.check.maxAttempts",
        defaultMessage: "Minimum Connection Attempts Required to Determine Host is Disconnected",
      }),
      description: intl.formatMessage({
        id: "globalConfig.ha.host.check.maxAttempts.description",
        defaultMessage: `### Minimum Connection Attempts Required to Determine Host is Disconnected

The maximum times for the system to attempt to connect to a host. If the system fails to connect to the host after the specified times of attempt, the host is determined as disconnected. Default: 12.`,
      }),
      firstCategory: intl.formatMessage({
        id: "platform.strategy",
        defaultMessage: "Platform Policy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "high.availability.strategy",
        defaultMessage: "HA Policy",
      }),
      secondCategoryKey: "high.availability.strategy",
      formItem: {
        validatorName: "validZeroTimes",
        translateValue: "translateSingleUnit",
        formatFunction: "formatUnitWithNoUnit",
        inputType: "InputWithUnit",
        unitList: [
          {
            value: "",
            displayName: intl.formatMessage({
              id: "count.ci",
              defaultMessage: "times",
            }),
          },
        ],
        selectList: [],
      },
    },
    {
      key: "ha.host.check.successInterval",
      license: "Community",
      categoryType: "HA",
      name: intl.formatMessage({
        id: "globalConfig.ha.host.check.successInterval",
        defaultMessage: "Ping Response Time to Determine Host Connection is Established Successfully",
      }),
      description: intl.formatMessage({
        id: "globalConfig.ha.host.check.successInterval.description",
        defaultMessage: `### Ping Response Time to Determine Host Connection is Established Successfully

The time period for the system to wait the host response after it pings the host. Receiving a response within this period indicates that the system establishes a successful connection with the host. Default: 5. Unit: second.`,
      }),
      firstCategory: intl.formatMessage({
        id: "platform.strategy",
        defaultMessage: "Platform Policy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "high.availability.strategy",
        defaultMessage: "HA Policy",
      }),
      secondCategoryKey: "high.availability.strategy",
      formItem: {
        validatorName: "validZeroSeconds",
        translateValue: "translateSecondTime",
        formatFunction: "formatUnitWithNoUnit",
        inputType: "InputWithUnit",
        unitList: [
          {
            value: "",
            displayName: intl.formatMessage({
              id: "second",
              defaultMessage: " seconds",
            }),
          },
        ],
        selectList: [],
      },
    },
    {
      key: "ha.host.check.successTimes",
      license: "Community",
      categoryType: "HA",
      name: intl.formatMessage({
        id: "globalConfig.ha.host.check.successTimes",
        defaultMessage: "Minimum Successful Connections Required to Determine Host is Re-Connected",
      }),
      description: intl.formatMessage({
        id: "globalConfig.ha.host.check.successTimes.description",
        defaultMessage: `### Minimum Successful Connections Required to Determine Host is Re-Connected

The minimum successful connections that the system has to establish with a disconnected host before the host can be determined as re-connected. Default: 5.`,
      }),
      firstCategory: intl.formatMessage({
        id: "platform.strategy",
        defaultMessage: "Platform Policy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "high.availability.strategy",
        defaultMessage: "HA Policy",
      }),
      secondCategoryKey: "high.availability.strategy",
      formItem: {
        validatorName: "validZeroTimes",
        translateValue: "translateSingleUnit",
        formatFunction: "formatUnitWithNoUnit",
        inputType: "InputWithUnit",
        unitList: [
          {
            value: "",
            displayName: intl.formatMessage({
              id: "count.ci",
              defaultMessage: "times",
            }),
          },
        ],
        selectList: [],
      },
    },
    {
      key: "ha.host.selfFencer.interval",
      license: "Community",
      categoryType: "HA",
      name: intl.formatMessage({
        id: "globalConfig.ha.host.selfFencer.interval",
        defaultMessage: "Host Self-Inspection Interval",
      }),
      description: intl.formatMessage({
        id: "globalConfig.ha.host.selfFencer.interval.description",
        defaultMessage: `The interval that a host inspects its own status. Default: 5. Unit: second.`,
      }),
      firstCategory: intl.formatMessage({
        id: "platform.strategy",
        defaultMessage: "Platform Policy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "high.availability.strategy",
        defaultMessage: "HA Policy",
      }),
      secondCategoryKey: "high.availability.strategy",
      formItem: {
        validatorName: "validZeroSeconds",
        translateValue: "translateSecondTime",
        formatFunction: "formatUnitWithNoUnit",
        inputType: "InputWithUnit",
        unitList: [
          {
            value: "",
            displayName: intl.formatMessage({
              id: "second",
              defaultMessage: " seconds",
            }),
          },
        ],
        selectList: [],
      },
    },
    {
      key: "ha.host.selfFencer.maxAttempts",
      license: "Community",
      categoryType: "HA",
      name: intl.formatMessage({
        id: "globalConfig.ha.host.selfFencer.maxAttempts",
        defaultMessage: "Maximum Host Self-Inspection Attempts",
      }),
      description: intl.formatMessage({
        id: "globalConfig.ha.host.selfFencer.maxAttempts.description",
        defaultMessage: `The maximum number of attempts that a host inspects its own status. If the self-inspection of a host fails by the maximum attempts, it is determined that network errors occur with the host. Default: 6.`,
      }),
      firstCategory: intl.formatMessage({
        id: "platform.strategy",
        defaultMessage: "Platform Policy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "high.availability.strategy",
        defaultMessage: "HA Policy",
      }),
      secondCategoryKey: "high.availability.strategy",
      formItem: {
        validatorName: "validZeroTimes",
        translateValue: "translateSingleUnit",
        formatFunction: "formatUnitWithNoUnit",
        inputType: "InputWithUnit",
        unitList: [
          {
            value: "",
            displayName: intl.formatMessage({
              id: "count.ci",
              defaultMessage: "times",
            }),
          },
        ],
        selectList: [],
      },
    },
    {
      key: "ha.host.selfFencer.storageChecker.timeout",
      license: "Community",
      categoryType: "HA",
      name: intl.formatMessage({
        id: "globalConfig.ha.host.selfFencer.storageChecker.timeout",
        defaultMessage: "Timeout Period for Host Connecting to Data Storage",
      }),
      description: intl.formatMessage({
        id: "globalConfig.ha.host.selfFencer.storageChecker.timeout.description",
        defaultMessage: `### Timeout Period for Host Connecting to Data Storage

The time for hosts to attempt to connect to data storage. If a host fails to connect to a data storage during this period, its connection attempt is determined as timeout. Default: 5. Unit: second.`,
      }),
      firstCategory: intl.formatMessage({
        id: "platform.strategy",
        defaultMessage: "Platform Policy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "high.availability.strategy",
        defaultMessage: "HA Policy",
      }),
      secondCategoryKey: "high.availability.strategy",
      formItem: {
        validatorName: "validZeroSeconds",
        translateValue: "translateSecondTime",
        formatFunction: "formatUnitWithNoUnit",
        inputType: "InputWithUnit",
        unitList: [
          {
            value: "",
            displayName: intl.formatMessage({
              id: "second",
              defaultMessage: " seconds",
            }),
          },
        ],
        selectList: [],
      },
    },
    {
      key: "ha.neverStopVm.gc.maxRetryIntervalTime",
      license: "Community",
      categoryType: "HA",
      name: intl.formatMessage({
        id: "globalConfig.ha.neverStopVm.gc.maxRetryIntervalTime",
        defaultMessage: "Maximum Interval for VM Attempt to HA Start",
      }),
      description: intl.formatMessage({
        id: "globalConfig.ha.neverStopVm.gc.maxRetryIntervalTime.description",
        defaultMessage: `### Maximum Interval for VM Attempt to HA Start

The maximum interval for the system to finish the GC (garbage collection) job and attempt to restart a NeverStop VM according to the HA policy after the virtual machine is stopped unexpectedly. Default: 300. Unit: second.`,
      }),
      firstCategory: intl.formatMessage({
        id: "platform.strategy",
        defaultMessage: "Platform Policy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "high.availability.strategy",
        defaultMessage: "HA Policy",
      }),
      secondCategoryKey: "high.availability.strategy",
      formItem: {
        validatorName: "validZeroSeconds",
        translateValue: "translateSecondTime",
        formatFunction: "formatUnitWithNoUnit",
        inputType: "InputWithUnit",
        unitList: [
          {
            value: "",
            displayName: intl.formatMessage({
              id: "second",
              defaultMessage: " seconds",
            }),
          },
        ],
        selectList: [],
      },
    },
    {
      key: "ha.neverStopVm.retry.delay",
      license: "Community",
      categoryType: "HA",
      name: intl.formatMessage({
        id: "globalConfig.ha.neverStopVm.retry.delay",
        defaultMessage: "VM Retry HA Start Inverval",
      }),
      description: intl.formatMessage({
        id: "globalConfig.ha.neverStopVm.retry.delay.description",
        defaultMessage: `### VM Retry HA Start Inverval

The interval for a Neverstop VM to retry an HA start after the previous HA start attempt fails. Default: 60. Unit: second.`,
      }),
      firstCategory: intl.formatMessage({
        id: "platform.strategy",
        defaultMessage: "Platform Policy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "high.availability.strategy",
        defaultMessage: "HA Policy",
      }),
      secondCategoryKey: "high.availability.strategy",
      formItem: {
        validatorName: "validZeroSeconds",
        translateValue: "translateSecondTime",
        formatFunction: "formatUnitWithNoUnit",
        inputType: "InputWithUnit",
        unitList: [
          {
            value: "",
            displayName: intl.formatMessage({
              id: "second",
              defaultMessage: " seconds",
            }),
          },
        ],
        selectList: [],
      },
    },
    {
      key: "ha.neverStopVm.scan.interval",
      license: "Community",
      categoryType: "HA",
      name: intl.formatMessage({
        id: "globalConfig.ha.neverStopVm.scan.interval",
        defaultMessage: "HA VM State Scanning Interval",
      }),
      description: intl.formatMessage({
        id: "globalConfig.ha.neverStopVm.scan.interval.description",
        defaultMessage: `### HA VM State Scanning Interval

The interval to scan the status of a NeverStop VM after it fails to HA start. Default: 60. Unit: second.`,
      }),
      firstCategory: intl.formatMessage({
        id: "platform.strategy",
        defaultMessage: "Platform Policy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "high.availability.strategy",
        defaultMessage: "HA Policy",
      }),
      secondCategoryKey: "high.availability.strategy",
      formItem: {
        validatorName: "validOneSeconds",
        translateValue: "translateSecondTime",
        formatFunction: "formatUnitWithNoUnit",
        inputType: "InputWithUnit",
        unitList: [
          {
            value: "",
            displayName: intl.formatMessage({
              id: "second",
              defaultMessage: " seconds",
            }),
          },
        ],
        selectList: [],
      },
    },
    {
      key: "ha.notification.timeliness",
      license: "Community",
      categoryType: "HA",
      name: intl.formatMessage({
        id: "globalConfig.ha.notification.timeliness",
        defaultMessage: "HA VM State Update Speed",
      }),
      description: intl.formatMessage({
        id: "globalConfig.ha.notification.timeliness.description",
        defaultMessage: `### HA VM State Update Speed

The speed of updating the state of NeverStop virtual machines on the UI. Default: 1. Valid values: -1 to 5. A higher value indicates a lower update speed. However, a lower update speed makes the system ignore a lot of outdated notifications, thus decreasing the system workload. If set to -1, the NeverStop VM states on the UI are not updated automatically.`,
      }),
      firstCategory: intl.formatMessage({
        id: "platform.strategy",
        defaultMessage: "Platform Policy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "high.availability.strategy",
        defaultMessage: "HA Policy",
      }),
      secondCategoryKey: "high.availability.strategy",
      formItem: {
        translateValue: "translateSelectValue",
        inputType: "Select",
        unitList: [],
        selectList: ["-1", "0", "1", "2", "3", "4", "5"].map((t) => {
          return {
            value: t,
            displayName: t,
          };
        }),
      },
    },
    {
      key: "ha.self.fencer.strategy",
      license: "Community",
      categoryType: "HA",
      name: intl.formatMessage({
        id: "globalConfig.ha.self.fencer.strategy",
        defaultMessage: "VM HA Policy",
      }),
      description: intl.formatMessage({
        id: "globalConfig.ha.self.fencer.strategy.description",
        defaultMessage: ``,
      }),
      firstCategory: intl.formatMessage({
        id: "platform.strategy",
        defaultMessage: "Platform Policy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "high.availability.strategy",
        defaultMessage: "HA Policy",
      }),
      secondCategoryKey: "high.availability.strategy",
      formItem: {
        translateValue: "translateSelectValue",
        inputType: "Select",
        unitList: [],
        selectList: [
          {
            value: "Permissive",
            displayName: intl.formatMessage({
              id: "globalConfig.Permissive",
              defaultMessage: "Permissive",
            }),
          },
          {
            value: "Force",
            displayName: intl.formatMessage({
              id: "globalConfig.Force",
              defaultMessage: "Force",
            }),
          },
        ],
      },
    },
    {
      key: "ha.vm.ha.level",
      license: "Community",
      categoryType: "HA",
      name: intl.formatMessage({
        id: "globalConfig.ha.vm.ha.level",
        defaultMessage: "VM HA Mode",
      }),
      description: intl.formatMessage({
        id: "globalConfig.ha.vm.ha.level.description",
        defaultMessage: `### HA Mode
Specifies whether to enable auto restart if virtual machines are scheduled or unexpectedly stopped or are errored because of errors occurring to compute, network, or storage resources associated with the virtual machines.  Valid values: None and NeverStop.

1. If you set HA mode to None, virtual machines scheduled or unexpectedly stopped are not auto restarted.

2. If you set HA mode to NeverStop:

- virtual machines scheduled or unexpectedly stopped are auto restarted.
- If errors occur to compute, network, or storage resources, associated virtual machines are auto restarted on another host depending on the HA policy you configure for them.

Note that you can specifically set VM HA mode for a virtual machine. If you do, this System Parameter does not take effect on the virtual machine.`,
      }),
      firstCategory: intl.formatMessage({
        id: "platform.strategy",
        defaultMessage: "Platform Policy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "high.availability.strategy",
        defaultMessage: "HA Policy",
      }),
      secondCategoryKey: "high.availability.strategy",
      alertMessage: intl.formatMessage({
        id: "globalConfig.ha.vm.ha.level.alert",
        defaultMessage: ` If you specifically set VM HA mode for a virtual machine, this global setting does not take effect on the virtual machine.`,
      }),
      formItem: {
        translateValue: "translateSelectValue",
        inputType: "Select",
        unitList: [],
        selectList: [
          {
            value: "None",
            displayName: intl.formatMessage({
              id: "None",
              defaultMessage: "None",
            }),
          },
          {
            value: "NeverStop",
            displayName: intl.formatMessage({
              id: "NeverStop",
              defaultMessage: "NeverStop",
            }),
          },
        ],
      },
    },
    {
      key: "ha.enable",
      license: "Community",
      categoryType: "HA",
      name: intl.formatMessage({
        id: "globalConfig.ha.enable",
        defaultMessage: "VM HA",
      }),
      description: intl.formatMessage({
        id: "globalConfig.ha.enable.description",
        defaultMessage: `### VM HA
1. Specifies whether to enable high availability for virtual machines. Default: true.

2. If set to false, the high availability feature is disabled globally for virtual machines. Please proceed with caution.`,
      }),
      firstCategory: intl.formatMessage({
        id: "platform.strategy",
        defaultMessage: "Platform Policy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "high.availability.strategy",
        defaultMessage: "HA Policy",
      }),
      secondCategoryKey: "high.availability.strategy",
      alertMessage: intl.formatMessage({
        id: "globalConfig.ha.enable.alert",
        defaultMessage: `If set to false, the high availability feature is disabled globally for virtual machines. Please proceed with caution.`,
      }),
      formItem: {
        inputType: "Switch",
        unitList: [],
        selectList: [],
      },
    },
    {
      key: "ha.host.check.successRatio",
      license: "Community",
      categoryType: "HA",
      name: intl.formatMessage({
        id: "globalConfig.ha.host.check.successRatio",
        defaultMessage: "Minimum Connection Success Rate to Determine Host is Re-Connected",
      }),
      description: intl.formatMessage({
        id: "globalConfig.ha.host.check.successRatio.description",
        defaultMessage: `### Minimum Connection Success Rate to Determine Host is Re-Connected

The minimum rate of successful connections occupied in total connection attempts to determine a disconnected host is successfully re-connected. Default: 50. Unit: %.`,
      }),
      firstCategory: intl.formatMessage({
        id: "platform.strategy",
        defaultMessage: "Platform Policy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "high.availability.strategy",
        defaultMessage: "HA Policy",
      }),
      secondCategoryKey: "high.availability.strategy",
      alertMessage: intl.formatMessage({
        id: "globalConfig.ha.host.check.successRatio.alert",
        defaultMessage: `Valid values: 1% to 99%.`,
      }),
      formItem: {
        validatorName: "validHaHostCheckSuccessRatio",
        translateValue: "translateHaHostCheckSuccessRatio",
        formatFunction: "formatHaHostCheckSuccessRatio",
        inputType: "InputWithUnit",
        unitList: [
          {
            value: "",
            displayName: intl.formatMessage({
              id: "percent",
              defaultMessage: "%",
            }),
          },
        ],
        selectList: [],
      },
    },
    {
      key: "ha.host.check.interval",
      license: "Community",
      categoryType: "HA",
      name: intl.formatMessage({
        id: "globalConfig.ha.host.check.interval",
        defaultMessage: "Abnormal Host Status Update Interval",
      }),
      description: intl.formatMessage({
        id: "globalConfig.ha.host.check.interval.description",
        defaultMessage: `### Abnormal Host Status Update Interval

The interval for the system to check and update the status of abnormal hosts. Default: 5. Unit: second.`,
      }),
      firstCategory: intl.formatMessage({
        id: "platform.strategy",
        defaultMessage: "Platform Policy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "high.availability.strategy",
        defaultMessage: "HA Policy",
      }),
      secondCategoryKey: "high.availability.strategy",
      formItem: {
        validatorName: "validZeroSeconds",
        translateValue: "translateSecondTime",
        formatFunction: "formatUnitWithNoUnit",
        inputType: "InputWithUnit",
        unitList: [
          {
            value: "",
            displayName: intl.formatMessage({
              id: "second",
              defaultMessage: " seconds",
            }),
          },
        ],
        selectList: [],
      },
    },
  ];
};
