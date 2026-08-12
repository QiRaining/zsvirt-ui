import { useIntl } from 'react-intl'

export default () => {
  const intl = useIntl()

  return [
    {
      key: 'virtualization.apiTimeout.org.zstack.header.image.APIAddImageMsg',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.apiTimeout.org.zstack.header.image.APIAddImageMsg', defaultMessage: 'Image Addition Timeout'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.apiTimeout.org.zstack.header.image.APIAddImageMsg.description', defaultMessage: `### Image Addition Timeout

Specify the maximum timeout limit for adding an image. If the image addition process exceeds this time limit, the operation will fail. Default: 3 days. Unit: second, minute, hour, and day.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.timeout.policy', defaultMessage: 'Timeout Policy'}),
      secondCategoryKey: 'virtualization.timeout.policy',
      formItem: {
        validatorName: 'validApiTimeout',
        translateValue: 'translateMillisecondTimeOrWithUnit',
        formatFunction: 'formatUnitWithUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: 's',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
          {
            value: 'm',
            displayName: intl.formatMessage({id: 'minute', defaultMessage: 'minutes'})
          },
          {
            value: 'h',
            displayName: intl.formatMessage({id: 'hour', defaultMessage: 'hours'})
          },
          {
            value: 'd',
            displayName: intl.formatMessage({id: 'day', defaultMessage: 'days'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.apiTimeout.org.zstack.header.image.APICreateDataVolumeTemplateFromVolumeMsg',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.apiTimeout.org.zstack.header.image.APICreateDataVolumeTemplateFromVolumeMsg', defaultMessage: 'Timeout for Creating Disk Image from Data Disk'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.apiTimeout.org.zstack.header.image.APICreateDataVolumeTemplateFromVolumeMsg.description', defaultMessage: `### Timeout for Creating Disk Image from Data Disk

Specify the maximum timeout limit for creating a disk image from a data disk. If the creation exceeds the time limit, the operation will fail. Default: 3 days. Unit: second, minute, hour, and day. `}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.timeout.policy', defaultMessage: 'Timeout Policy'}),
      secondCategoryKey: 'virtualization.timeout.policy',
      formItem: {
        validatorName: 'validApiTimeout',
        translateValue: 'translateMillisecondTimeOrWithUnit',
        formatFunction: 'formatUnitWithUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: 's',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
          {
            value: 'm',
            displayName: intl.formatMessage({id: 'minute', defaultMessage: 'minutes'})
          },
          {
            value: 'h',
            displayName: intl.formatMessage({id: 'hour', defaultMessage: 'hours'})
          },
          {
            value: 'd',
            displayName: intl.formatMessage({id: 'day', defaultMessage: 'days'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.apiTimeout.org.zstack.header.image.APICreateRootVolumeTemplateFromRootVolumeMsg',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.apiTimeout.org.zstack.header.image.APICreateRootVolumeTemplateFromRootVolumeMsg', defaultMessage: 'Timeout for Creating Disk Image from Disk 1'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.apiTimeout.org.zstack.header.image.APICreateRootVolumeTemplateFromRootVolumeMsg.description', defaultMessage: `### Timeout for Creating Disk Image from Disk 1

Specify the maximum timeout limit for creating a disk image from disk 1. If the creation exceeds this time limit, the operation will fail. Default: 3 days. Unit: second, minute, hour, and day.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.timeout.policy', defaultMessage: 'Timeout Policy'}),
      secondCategoryKey: 'virtualization.timeout.policy',
      formItem: {
        validatorName: 'validApiTimeout',
        translateValue: 'translateMillisecondTimeOrWithUnit',
        formatFunction: 'formatUnitWithUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: 's',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
          {
            value: 'm',
            displayName: intl.formatMessage({id: 'minute', defaultMessage: 'minutes'})
          },
          {
            value: 'h',
            displayName: intl.formatMessage({id: 'hour', defaultMessage: 'hours'})
          },
          {
            value: 'd',
            displayName: intl.formatMessage({id: 'day', defaultMessage: 'days'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.apiTimeout.org.zstack.header.vm.APICreateVmInstanceMsg',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.apiTimeout.org.zstack.header.vm.APICreateVmInstanceMsg', defaultMessage: 'VM Creation Timeout'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.apiTimeout.org.zstack.header.vm.APICreateVmInstanceMsg.description', defaultMessage: `### VM Creation Timeout

Specify the maximum timeout limit for creating a virtual machine. If the creation exceeds this time limit, the operation will fail. Default: 12 hours. Unit: second, minute, hour, and day.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.timeout.policy', defaultMessage: 'Timeout Policy'}),
      secondCategoryKey: 'virtualization.timeout.policy',
      formItem: {
        validatorName: 'validApiTimeout',
        translateValue: 'translateMillisecondTimeOrWithUnit',
        formatFunction: 'formatUnitWithUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: 's',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
          {
            value: 'm',
            displayName: intl.formatMessage({id: 'minute', defaultMessage: 'minutes'})
          },
          {
            value: 'h',
            displayName: intl.formatMessage({id: 'hour', defaultMessage: 'hours'})
          },
          {
            value: 'd',
            displayName: intl.formatMessage({id: 'day', defaultMessage: 'days'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.apiTimeout.org.zstack.header.volume.APICreateDataVolumeFromVolumeTemplateMsg',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.apiTimeout.org.zstack.header.volume.APICreateDataVolumeFromVolumeTemplateMsg', defaultMessage: 'Timeout for Creating Disk from Disk Image'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.apiTimeout.org.zstack.header.volume.APICreateDataVolumeFromVolumeTemplateMsg.description', defaultMessage: `### Timeout for Creating Disk from Disk Image

Specify the maximum timeout limit for creating a disk from a disk image. If the creation exceeds this time limit, the operation will fail. Default: 3 days. Unit: second, minute, hour, and day.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.timeout.policy', defaultMessage: 'Timeout Policy'}),
      secondCategoryKey: 'virtualization.timeout.policy',
      formItem: {
        validatorName: 'validApiTimeout',
        translateValue: 'translateMillisecondTimeOrWithUnit',
        formatFunction: 'formatUnitWithUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: 's',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
          {
            value: 'm',
            displayName: intl.formatMessage({id: 'minute', defaultMessage: 'minutes'})
          },
          {
            value: 'h',
            displayName: intl.formatMessage({id: 'hour', defaultMessage: 'hours'})
          },
          {
            value: 'd',
            displayName: intl.formatMessage({id: 'day', defaultMessage: 'days'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.console.agent.ping.interval',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.console.agent.ping.interval', defaultMessage: 'AgentPing Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.console.agent.ping.interval.description', defaultMessage: `### AgentPing Interval

Specify the time interval for checking the status of the agent program on the console. Default: 60. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.hosts.and.vms', defaultMessage: 'Host and VM'}),
      firstCategoryKey: 'virtualization.hosts.and.vms',
      secondCategory: intl.formatMessage({id: 'virtualization.vm', defaultMessage: 'Virtual Machine'}),
      secondCategoryKey: 'virtualization.vm',
      formItem: {
        validatorName: 'validOneSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.console.proxy.idleTimeout',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.console.proxy.idleTimeout', defaultMessage: 'Agent Idle Timeout'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.console.proxy.idleTimeout.description', defaultMessage: `### Agent Idle Timeout

Specify the maximum idle time for the console agent before it times out. Default: 60. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.hosts.and.vms', defaultMessage: 'Host and VM'}),
      firstCategoryKey: 'virtualization.hosts.and.vms',
      secondCategory: intl.formatMessage({id: 'virtualization.vm', defaultMessage: 'Virtual Machine'}),
      secondCategoryKey: 'virtualization.vm',
      formItem: {
        validatorName: 'validZeroSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.console.vnc.token.timeout',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.console.vnc.token.timeout', defaultMessage: 'VNC Token Timeout'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.console.vnc.token.timeout.description', defaultMessage: `### VNC Token Timeout

Specify the duration for which a VNC token remains valid. When you launch a VM console, the system generates a token required for the console connection. If you do not reconnect to the VM within the specified timeout period, the token becomes invalid and cannot be used for further console connections. To regain access, simply re-launch the VM console, which will generate a new token. Default: 1,800. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.timeout.policy', defaultMessage: 'Timeout Policy'}),
      secondCategoryKey: 'virtualization.timeout.policy',
      formItem: {
        validatorName: 'validWithinZeroToMaxIntegerRange',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.ceph.backupStorage.mon.autoReconnect',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.ceph.backupStorage.mon.autoReconnect', defaultMessage: 'Auto Reconnect Image Storage Mon Node'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.ceph.backupStorage.mon.autoReconnect.description', defaultMessage: `### Auto Reconnect Image Storage Mon Node

Specify whether to automatically reconnect the monitoring nodes of a distributed image storage to the management node upon check failures. Default: enabled.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.image.storage', defaultMessage: 'Image Storage'}),
      firstCategoryKey: 'virtualization.image.storage',
      secondCategory: intl.formatMessage({id: 'virtualization.image.storage', defaultMessage: 'Image Storage'}),
      secondCategoryKey: 'virtualization.image.storage',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.ceph.backupStorage.mon.reconnectDelay',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.ceph.backupStorage.mon.reconnectDelay', defaultMessage: 'Image Storage Mon Node Reconnection Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.ceph.backupStorage.mon.reconnectDelay.description', defaultMessage: `Default: 30. Unit: Second. The interval that the management node reconnects the monitoring node of the distributed image storage if the monitoring node fails to be detected.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.image.storage', defaultMessage: 'Image Storage'}),
      firstCategoryKey: 'virtualization.image.storage',
      secondCategory: intl.formatMessage({id: 'virtualization.image.storage', defaultMessage: 'Image Storage'}),
      secondCategoryKey: 'virtualization.image.storage',
      formItem: {
        validatorName: 'validZeroSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.apiTimeout.org.zstack.storage.primary.local.APILocalStorageMigrateVolumeMsg',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.apiTimeout.org.zstack.storage.primary.local.APILocalStorageMigrateVolumeMsg', defaultMessage: 'Local Storage Disk Migration Timeout'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.apiTimeout.org.zstack.storage.primary.local.APILocalStorageMigrateVolumeMsg.description', defaultMessage: `The timeout period of migrating a disk from a Local Storage primary storage. Default: 1 day. Unit: second, minute, hour, and day. If the disk fails to be migrated before the migration times out, the migration fails.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      firstCategoryKey: 'virtualization.globalConfig.dataStorage',
      secondCategory: intl.formatMessage({id: 'virtualization.volume', defaultMessage: 'Disk'}),
      secondCategoryKey: 'virtualization.volume',
      formItem: {
        validatorName: 'validApiTimeout',
        translateValue: 'translateMillisecondTimeOrWithUnit',
        formatFunction: 'formatUnitWithUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: 's',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
          {
            value: 'm',
            displayName: intl.formatMessage({id: 'minute', defaultMessage: 'minutes'})
          },
          {
            value: 'h',
            displayName: intl.formatMessage({id: 'hour', defaultMessage: 'hours'})
          },
          {
            value: 'd',
            displayName: intl.formatMessage({id: 'day', defaultMessage: 'days'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.backupStorage.ping.interval',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.backupStorage.ping.interval', defaultMessage: 'Image Storage Ping Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.backupStorage.ping.interval.description', defaultMessage: `### Image Storage Ping Interval

Specify the time interval at which the management node checks the connectivity of the image storage. If the check (ping) is successful, it indicates that the image storage is in a connected state. Default: 60. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.management.node.policy', defaultMessage: 'Management Node Policy'}),
      secondCategoryKey: 'virtualization.management.node.policy',
      formItem: {
        validatorName: 'validWithinZeroToMaxIntegerRange',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.backupStorage.ping.parallelismDegree',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.backupStorage.ping.parallelismDegree', defaultMessage: 'Image Storage Ping Max Concurrency'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.backupStorage.ping.parallelismDegree.description', defaultMessage: `### Image Storage Ping Max Concurrency

Specify the maximum number of image storage checks that can be performed concurrently by the management node. Default: 50.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.concurrency.strategy', defaultMessage: 'Concurrency Policy'}),
      secondCategoryKey: 'virtualization.concurrency.strategy',
      formItem: {
        validatorName: 'validWithinZeroToMaxIntegerRange',
        componentProps: { disableNonZhLangUnit: true },
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ge', defaultMessage: ' '})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.baremetalInstance.deletionPolicy',
      subLicense: 'baremetal',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.baremetalInstance.deletionPolicy', defaultMessage: 'Bare Metal Instance Deletion Policy'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.baremetalInstance.deletionPolicy.description', defaultMessage: `### Bare Metal Instance Deletion Policy

Specify the deletion policy for bare metal instances. Default: Never Delete. Options include Immediate Deletion and Never Delete.

- Immediate Deletion: The bare metal instance is directly expunged as soon as you delete it.
- Never Delete:
    - The bare metal instance is moved to the Recycle Bin after deletion and will not be automatically expunged. You can recover a deleted bare metal instance from the Recycle Bin.
    - Bare metal instances in the Recycle Bin can be manually expunged. Once expunged, they cannot be recovered. Proceed with caution.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.delete.policy', defaultMessage: 'Deletion Policy'}),
      secondCategoryKey: 'virtualization.delete.policy',
      formItem: {
        translateValue: 'translateSelectValue',
        inputType: 'Select',
        unitList: [
        ],
        selectList: [
          {
            value: 'Direct',
            displayName: intl.formatMessage({id: 'globalConfig.deletionPolicy.Direct', defaultMessage: 'Immediate Deletion'})
          },
          {
            value: 'Delay',
            displayName: intl.formatMessage({id: 'globalConfig.deletionPolicy.Delay.display.Never', defaultMessage: 'Never Delete'})
          },
        ]
      }
    },
    {
      key: 'virtualization.ceph.deletion.gcInterval',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.ceph.deletion.gcInterval', defaultMessage: 'Distributed Storage GC Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.ceph.deletion.gcInterval.description', defaultMessage: `### Distributed Storage GC Interval

Specify the time interval at which the distributed storage system performs garbage collection to clean up unused or orphaned data on disks. Default: 3,600. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      firstCategoryKey: 'virtualization.globalConfig.dataStorage',
      secondCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      secondCategoryKey: 'virtualization.globalConfig.dataStorage',
      formItem: {
        validatorName: 'validOneSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.ceph.imageCache.cleanup.interval',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.ceph.imageCache.cleanup.interval', defaultMessage: 'Ceph Distributed Storage Image Cache Cleanup Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.ceph.imageCache.cleanup.interval.description', defaultMessage: `### Ceph Distributed Storage Image Cache Cleanup Interval

The interval of cleaning image caches from Ceph distributed storage. This setting is applied after images in distributed storage are deleted and image caches are no longer used by virtual machines. Default: 43,200. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      firstCategoryKey: 'virtualization.globalConfig.dataStorage',
      secondCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      secondCategoryKey: 'virtualization.globalConfig.dataStorage',
      formItem: {
        validatorName: 'validOneSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.ceph.primaryStorage.deletePool',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.ceph.primaryStorage.deletePool', defaultMessage: 'Distributed Storage Pool Deletion Policy'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.ceph.primaryStorage.deletePool.description', defaultMessage: `### Distributed Storage Pool Deletion Policy

Specify whether to delete all storage pools when deleting distributed storage. Default: disabled. If enabled, this may result in data loss. Proceed with caution.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      firstCategoryKey: 'virtualization.globalConfig.dataStorage',
      secondCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      secondCategoryKey: 'virtualization.globalConfig.dataStorage',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.ceph.primaryStorage.mon.autoReconnect',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.ceph.primaryStorage.mon.autoReconnect', defaultMessage: 'Auto Reconnect Distributed Storage Mon Node'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.ceph.primaryStorage.mon.autoReconnect.description', defaultMessage: `### Auto Reconnect Distributed Storage Mon Node

Specify whether to automatically reconnect the monitoring nodes of a distributed storage to the management node upon check failures. Default: enabled.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.reconnection.strategy', defaultMessage: 'Reconnection Policy'}),
      secondCategoryKey: 'virtualization.reconnection.strategy',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.ceph.primaryStorage.mon.reconnectDelay',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.ceph.primaryStorage.mon.reconnectDelay', defaultMessage: 'Distributed Storage Mon Node Reconnection Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.ceph.primaryStorage.mon.reconnectDelay.description', defaultMessage: `### Distributed Storage Mon Node Reconnection Interval

Specify the time interval before the management node of a distributed storage system attempts to reconnect after a failed check. Default: 30. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.reconnection.strategy', defaultMessage: 'Reconnection Policy'}),
      secondCategoryKey: 'virtualization.reconnection.strategy',
      formItem: {
        validatorName: 'validZeroSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.databaseBackup.coverDatabase.allow',
      subLicense: 'disaster-recovery',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.databaseBackup.coverDatabase.allow', defaultMessage: 'Restore Platform Database from Backup Data'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.databaseBackup.coverDatabase.allow.description', defaultMessage: `### Restore Platform Database from Backup Data

Specify whether to allow restoring platform database from backup data when data exists in the database. Default: enabled.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.data.protection', defaultMessage: 'Data Protection'}),
      firstCategoryKey: 'virtualization.data.protection',
      secondCategory: intl.formatMessage({id: 'virtualization.backup.management', defaultMessage: 'Backup Management'}),
      secondCategoryKey: 'virtualization.backup.management',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.flatNetworkProvider.allow.default.dns',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.flatNetworkProvider.allow.default.dns', defaultMessage: 'Inject DNS into VM'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.flatNetworkProvider.allow.default.dns.description', defaultMessage: `### Inject DNS into VM

Specify whether to inject DNS server addresses into  virtual machines. Default: disabled. If enabled,  virtual machines will be able to resolve each other's hostnames.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.hosts.and.vms', defaultMessage: 'Host and VM'}),
      firstCategoryKey: 'virtualization.hosts.and.vms',
      secondCategory: intl.formatMessage({id: 'virtualization.vm', defaultMessage: 'Virtual Machine'}),
      secondCategoryKey: 'virtualization.vm',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.gc.orphanJobScanInterval',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.gc.orphanJobScanInterval', defaultMessage: 'Orphan GC Scan Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.gc.orphanJobScanInterval.description', defaultMessage: `### Orphan GC Scan Interval

Specify the time interval at which the management node scans for orphaned GC (Garbage Collection) jobs. If orphaned GC jobs are detected, the management node takes over the jobs. Default: 60. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.management.node.policy', defaultMessage: 'Management Node Policy'}),
      secondCategoryKey: 'virtualization.management.node.policy',
      formItem: {
        validatorName: 'validWithinOneToMaxIntegerRange',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.hostAllocator.hostAllocator.checkHostMem',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.hostAllocator.hostAllocator.checkHostMem', defaultMessage: 'Overcommit VM Memory'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.hostAllocator.hostAllocator.checkHostMem.description', defaultMessage: `### Overcommit VM Memory

Specify whether to enable memory overcommitment for virtual machines. Default: enabled. If enabled, when assigning a virtual machine to a host, any host where the requested memory quota exceeds the available memory will be filtered out.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.hosts.and.vms', defaultMessage: 'Host and VM'}),
      firstCategoryKey: 'virtualization.hosts.and.vms',
      secondCategory: intl.formatMessage({id: 'virtualization.vm', defaultMessage: 'Virtual Machine'}),
      secondCategoryKey: 'virtualization.vm',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.hostAllocator.hostAllocator.concurrent',
      mergeKey: 'hostAllocator.hostAllocator.concurrent||hostAllocator.hostAllocator.concurrent.level',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.hostAllocator.hostAllocator.concurrent', defaultMessage: 'Host Allocation Concurrency'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.hostAllocator.hostAllocator.concurrent.description', defaultMessage: `### Host Allocation Concurrency

Specify whether the host allocation process supports concurrent operations. Default: disabled. If enabled, you can specify the maximum number of host allocators that can be concurrently running. Default: 10. Valid values: 1 to 255. Setting a high concurrent allocation may lead to increased host load.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.concurrency.strategy', defaultMessage: 'Concurrency Policy'}),
      secondCategoryKey: 'virtualization.concurrency.strategy',
      formItem: {
        componentProps: { disableNonZhLangUnit: true },
        translateValue: 'translateHostAllocator',
        inputType: 'HostAllocator',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.hostAllocator.hostAllocator.concurrent.level',
      mergeKey: 'hostAllocator.hostAllocator.concurrent||hostAllocator.hostAllocator.concurrent.level',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.hostAllocator.hostAllocator.concurrent.level', defaultMessage: 'Host Allocation Concurrency'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.hostAllocator.hostAllocator.concurrent.level.description', defaultMessage: `### Host Allocation Concurrency

Specify whether the host allocation process supports concurrent operations. Default: disabled. If enabled, you can specify the maximum number of host allocators that can be concurrently running. Default: 10. Valid values: 1 to 255. Setting a high concurrent allocation may lead to increased host load.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.concurrency.strategy', defaultMessage: 'Concurrency Policy'}),
      secondCategoryKey: 'virtualization.concurrency.strategy',
      formItem: {
        validatorName: 'validHostAllocatorConcurrentLevel',
        componentProps: { disableNonZhLangUnit: true },
        translateValue: 'translateHostAllocator',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'HostAllocator',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ge', defaultMessage: ' '})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.kvm.host.syncLevel',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.kvm.host.syncLevel', defaultMessage: 'Host Concurrency Level'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.kvm.host.syncLevel.description', defaultMessage: `### Host Concurrency Level

Specify the the maximum number of concurrent commands that can be executed on the host. Default: 10. Setting a high concurrency level may lead to increased host load.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.concurrency.strategy', defaultMessage: 'Concurrency Policy'}),
      secondCategoryKey: 'virtualization.concurrency.strategy',
      formItem: {
        validatorName: 'validWithinTwoToMaxIntegerRange',
        componentProps: { disableNonZhLangUnit: true },
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ge', defaultMessage: ' '})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.host.connection.autoReconnectOnError',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.host.connection.autoReconnectOnError', defaultMessage: 'Auto Reconnect Host on Ping Failure'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.host.connection.autoReconnectOnError.description', defaultMessage: `### Auto Reconnect Host on Ping Failure

Specify whether to automatically reconnect hosts to the management node, if the management node fails to ping hosts. Default: enabled.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.management.node.policy', defaultMessage: 'Management Node Policy'}),
      secondCategoryKey: 'virtualization.management.node.policy',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.host.connection.autoReconnectOnError.maxAttemptsNum',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.host.connection.autoReconnectOnError.maxAttemptsNum', defaultMessage: 'Host Max Reconnection Failures'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.host.connection.autoReconnectOnError.maxAttemptsNum.description', defaultMessage: `### Host Max Reconnection Failures

Specify the maximum number of consecutive failed reconnection attempts allowed by the management node before it stops trying to reconnect to a host. Default: 0.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.reconnection.strategy', defaultMessage: 'Reconnection Policy'}),
      secondCategoryKey: 'virtualization.reconnection.strategy',
      formItem: {
        validatorName: 'validZeroTimes',
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ci', defaultMessage: 'times'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.host.host.maintenance.policy',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.host.host.maintenance.policy', defaultMessage: 'VM Migration Failure Policy in Maintenance Mode'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.host.host.maintenance.policy.description', defaultMessage: `### VM Migration Failure Policy in Maintenance Mode

Specify the policy for handling virtual machine migration failures when host enters maintenance mode. Default: Force Stop VM.

- Non-Force Stop VM: The host cannot enter maintenance mode if a virtual machine fails to be migrated while the host is entering maintenance mode.
- Force Stop VM: The virtual machine will be forcefully shut down if migration fails while the host is entering maintenance mode.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.hosts.and.vms', defaultMessage: 'Host and VM'}),
      firstCategoryKey: 'virtualization.hosts.and.vms',
      secondCategory: intl.formatMessage({id: 'virtualization.host', defaultMessage: 'Host'}),
      secondCategoryKey: 'virtualization.host',
      formItem: {
        translateValue: 'translateSelectValue',
        inputType: 'Select',
        unitList: [
        ],
        selectList: [
          {
            value: 'StopVmOnMigrationFailure',
            displayName: intl.formatMessage({id: 'globalConfig.stopVmOnMigrationFailure', defaultMessage: 'Force Stop VM'})
          },
          {
            value: 'JustMigrate',
            displayName: intl.formatMessage({id: 'globalConfig.justMigrate', defaultMessage: 'Non-Force Stop VM'})
          },
        ]
      }
    },
    {
      key: 'virtualization.host.load.parallelismDegree',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.host.load.parallelismDegree', defaultMessage: 'Host Reconnection Concurrency'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.host.load.parallelismDegree.description', defaultMessage: `### Host Reconnection Concurrency

Specify the maximum number of concurrent host reconnection processes that can be initiated by the management node. Default: 100.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.concurrency.strategy', defaultMessage: 'Concurrency Policy'}),
      secondCategoryKey: 'virtualization.concurrency.strategy',
      formItem: {
        validatorName: 'validWithinZeroToMaxIntegerRange',
        componentProps: { disableNonZhLangUnit: true },
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.tai', defaultMessage: ' '})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.host.maintenanceMode.ignoreError',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.host.maintenanceMode.ignoreError', defaultMessage: 'Ignore Errors in Maintenance Mode'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.host.maintenanceMode.ignoreError.description', defaultMessage: `### Ignore Errors in Maintenance Mode

Specify whether to allow hosts to ignore errors and report requests as successful while the host is in maintenance mode. Default: disabled.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.hosts.and.vms', defaultMessage: 'Host and VM'}),
      firstCategoryKey: 'virtualization.hosts.and.vms',
      secondCategory: intl.formatMessage({id: 'virtualization.host', defaultMessage: 'Host'}),
      secondCategoryKey: 'virtualization.host',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.host.ping.interval',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.host.ping.interval', defaultMessage: 'Host Ping Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.host.ping.interval.description', defaultMessage: `### Host Ping Interval

Specify the time interval at which the management node checks the connectivity of the host. If the check (ping) is successful, it indicates that the host is in a connected state. Default: 60. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.management.node.policy', defaultMessage: 'Management Node Policy'}),
      secondCategoryKey: 'virtualization.management.node.policy',
      formItem: {
        validatorName: 'validWithinZeroToMaxIntegerRange',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.host.ping.maxFailure',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.host.ping.maxFailure', defaultMessage: 'Max Failed Attempts for Compute Node Inspection'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.host.ping.maxFailure.description', defaultMessage: `### Max Failed Attempts for Compute Node Inspection

Specify the maximum number of failed attempts allowed when the management node inspects compute nodes. Default: 3.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.timeout.policy', defaultMessage: 'Timeout Policy'}),
      secondCategoryKey: 'virtualization.timeout.policy',
      formItem: {
        validatorName: 'validZeroTimes',
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ci', defaultMessage: 'times'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.host.ping.parallelismDegree',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.host.ping.parallelismDegree', defaultMessage: 'Host Ping Max Concurrency'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.host.ping.parallelismDegree.description', defaultMessage: `### Host Ping Max Concurrency

Specify the maximum number of host connnectivity checks that can be performed concurrently by the management node. Default: 100.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.concurrency.strategy', defaultMessage: 'Concurrency Policy'}),
      secondCategoryKey: 'virtualization.concurrency.strategy',
      formItem: {
        validatorName: 'validWithinZeroToMaxIntegerRange',
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ci', defaultMessage: 'times'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.host.reconnectAllOnBoot',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.host.reconnectAllOnBoot', defaultMessage: 'Auto Reconnect Host'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.host.reconnectAllOnBoot.description', defaultMessage: `### Auto Reconnect Host

Specify whether to automatically reconnect all hosts while the management node starts its services. Default: enabled.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.reconnection.strategy', defaultMessage: 'Reconnection Policy'}),
      secondCategoryKey: 'virtualization.reconnection.strategy',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.host.update.os.parallelismDegree',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.host.update.os.parallelismDegree', defaultMessage: 'Host Upgrade Parallelism'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.host.update.os.parallelismDegree.description', defaultMessage: `### Host Upgrade Parallelism

Specify the maximum number of hosts within a cluster that can undergo system upgrades simultaneously. Default: 2.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.hosts.and.vms', defaultMessage: 'Host and VM'}),
      firstCategoryKey: 'virtualization.hosts.and.vms',
      secondCategory: intl.formatMessage({id: 'virtualization.host', defaultMessage: 'Host'}),
      secondCategoryKey: 'virtualization.host',
      formItem: {
        validatorName: 'validZeroIndividual',
        componentProps: { disableNonZhLangUnit: true },
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ge', defaultMessage: ' '})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.identity.session.cleanup.interval',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.identity.session.cleanup.interval', defaultMessage: 'Session Cleanup Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.identity.session.cleanup.interval.description', defaultMessage: `### Session Cleanup Interval

Specify the time interval for cleanning up sessions that have timed out. Default: 1 hour. Unit: second, minute, hour, and day.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.cleanUp.strategy', defaultMessage: 'Cleanup Policy'}),
      secondCategoryKey: 'virtualization.cleanUp.strategy',
      formItem: {
        validatorName: 'validZeroSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatTimeToSec',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: 's',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
          {
            value: 'm',
            displayName: intl.formatMessage({id: 'minute', defaultMessage: 'minutes'})
          },
          {
            value: 'h',
            displayName: intl.formatMessage({id: 'hour', defaultMessage: 'hours'})
          },
          {
            value: 'd',
            displayName: intl.formatMessage({id: 'day', defaultMessage: 'days'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.identity.session.maxConcurrent',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.identity.session.maxConcurrent', defaultMessage: 'Max User Session Connections'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.identity.session.maxConcurrent.description', defaultMessage: `### Max User Session Connections

Specify the maximum number of sessions that a single user can start with the management node. If the number of sessions for a user exceeds this limit, new sessions will be denied. Default: 500.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.management.node.policy', defaultMessage: 'Management Node Policy'}),
      secondCategoryKey: 'virtualization.management.node.policy',
      formItem: {
        validatorName: 'validWithinZeroToMaxIntegerRange',
        componentProps: { disableNonZhLangUnit: true },
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ge', defaultMessage: ' '})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.image.deletionPolicy',
      mergeKey: 'image.deletionPolicy||image.expungePeriod',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.image.deletionPolicy', defaultMessage: 'Image Deletion Policy'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.image.deletionPolicy.description', defaultMessage: `### Image Deletion Policy

Specify the deletion policy for images. Default: Delayed Deletion. Options include Delayed Deletion, Immediate Deletion, and Never Delete.

- Immediate Deletion: Directly delete the image from the database and file system.

- Delayed Deletion: Mark the image as Deleted. The image will be completely deleted from the database and file system after the retention period expires or when you manually force delete the image. The default retention period is 86,400 seconds.

- Never Delete: Remove the image from the database but retain its files indefinitely.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.delete.policy', defaultMessage: 'Deletion Policy'}),
      secondCategoryKey: 'virtualization.delete.policy',
      formItem: {
        translateValue: 'translateDeletePolicy',
        inputType: 'DeletionPolicy',
        unitList: [
        ],
        selectList: [
          {
            value: 'Delay',
            displayName: intl.formatMessage({id: 'globalConfig.deletionPolicy.Delay', defaultMessage: 'Delayed Deletion'})
          },
          {
            value: 'Direct',
            displayName: intl.formatMessage({id: 'globalConfig.deletionPolicy.Direct', defaultMessage: 'Immediate Deletion'})
          },
          {
            value: 'Never',
            displayName: intl.formatMessage({id: 'globalConfig.deletionPolicy.Never', defaultMessage: 'Never Delete'})
          },
        ]
      }
    },
    {
      key: 'virtualization.image.expungeInterval',
      mergeKey: 'vm.expungeInterval||image.expungeInterval||volume.expungeInterval',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.image.expungeInterval', defaultMessage: 'Recycle Bin Expired Resources Cleanup Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.image.expungeInterval.description', defaultMessage: `### Recycle Bin Expired Resources Cleanup Interval

Specify the time interval for automatic cleanup of expired resources in the recycle bin. Default: 1 hour. Unit: hour. The interval can be set as an integer between 1 and 24. When resources under the delayed deletion policy reach their preset retention time in the recycle bin, the system will check for expired resources at the specified interval and automatically clean them up.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.cleanUp.strategy', defaultMessage: 'Cleanup Policy'}),
      secondCategoryKey: 'virtualization.cleanUp.strategy',
      formItem: {
        validatorName: 'validExpungeInterval',
        translateValue: 'translateExpungeInterval',
        formatFunction: 'formatTimeToSec',
        inputType: 'ExpungeInterval',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'hour', defaultMessage: 'hours'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.image.expungePeriod',
      mergeKey: 'image.deletionPolicy||image.expungePeriod',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.image.expungePeriod', defaultMessage: 'Image deletion is thorough and interval-free.'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.image.expungePeriod.description', defaultMessage: `The default is delayed deletion, with optional types including immediate deletion, delayed deletion, and permanent non-deletion. This is used when managing node settings for image deletion strategy during mirroring. Immediate deletion: directly deletes the image from the database and at the file level; Delayed deletion: changes the image state to deleted, and only deletes it from the database and at the file level after the image has been fully deleted or manually forced by the user; Permanent non-deletion: deletes the image from the database but never deletes its files. The time interval for executing a full delete image task is set to 86400 seconds by default, with units in seconds.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.delete.policy', defaultMessage: 'Deletion Policy'}),
      secondCategoryKey: 'virtualization.delete.policy',
      formItem: {
        validatorName: 'validDeletePolicySeconds',
        translateValue: 'translateDeletePolicy',
        formatFunction: 'formatTimeToSec',
        inputType: 'DeletionPolicy',
        unitList: [
          {
            value: 's',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
          {
            value: 'm',
            displayName: intl.formatMessage({id: 'minute', defaultMessage: 'minutes'})
          },
          {
            value: 'h',
            displayName: intl.formatMessage({id: 'hour', defaultMessage: 'hours'})
          },
          {
            value: 'd',
            displayName: intl.formatMessage({id: 'day', defaultMessage: 'days'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.imagestore.reclaim.interval',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.imagestore.reclaim.interval', defaultMessage: 'Standalone Image Storage Data Cleanup Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.imagestore.reclaim.interval.description', defaultMessage: `### Standalone Image Storage Data Cleanup Interval

Specify the time interval for automatically cleaning up data in the standalone image storage. Default: 7 days. Unit: second, minute, hour, and day. If disabled, the automatic data cleanup is disabled.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.cleanUp.strategy', defaultMessage: 'Cleanup Policy'}),
      secondCategoryKey: 'virtualization.cleanUp.strategy',
      formItem: {
        validatorName: 'validOneSeconds',
        translateValue: 'translateZeroAndSecondTime',
        formatFunction: 'formatTimeToSec',
        inputType: 'SyncReclaimInterval',
        unitList: [
          {
            value: 's',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
          {
            value: 'm',
            displayName: intl.formatMessage({id: 'minute', defaultMessage: 'minutes'})
          },
          {
            value: 'h',
            displayName: intl.formatMessage({id: 'hour', defaultMessage: 'hours'})
          },
          {
            value: 'd',
            displayName: intl.formatMessage({id: 'day', defaultMessage: 'days'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.kvm.dataVolume.maxNum',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.kvm.dataVolume.maxNum', defaultMessage: 'Max Disks per VM'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.kvm.dataVolume.maxNum.description', defaultMessage: `### Max Disks per VM

Specify the maximum number of data disks that can be attached to a virtual machine. Default: 24.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.hosts.and.vms', defaultMessage: 'Host and VM'}),
      firstCategoryKey: 'virtualization.hosts.and.vms',
      secondCategory: intl.formatMessage({id: 'virtualization.vm', defaultMessage: 'Virtual Machine'}),
      secondCategoryKey: 'virtualization.vm',
      formItem: {
        validatorName: 'validKvmDataVolumeMaxNum',
        componentProps: { disableNonZhLangUnit: true },
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ge', defaultMessage: ' '})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.kvm.host.snapshot.syncLevel',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.kvm.host.snapshot.syncLevel', defaultMessage: 'Concurrent Snapshot Creations on a Single Host'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.kvm.host.snapshot.syncLevel.description', defaultMessage: `### Concurrent Snapshot Creations on a Single Host

Specify the maximum number of concurrent snapshot creation processes that can be executed on a single host. Default: 10. Setting a high concurrency may lead to increased host load.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.concurrency.strategy', defaultMessage: 'Concurrency Policy'}),
      secondCategoryKey: 'virtualization.concurrency.strategy',
      formItem: {
        validatorName: 'validWithinTwoToMaxIntegerRange',
        componentProps: { disableNonZhLangUnit: true },
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ge', defaultMessage: ' '})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.kvm.restartagentwhenfakedead',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.kvm.restartagentwhenfakedead', defaultMessage: 'Restart Hung KVM Agent'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.kvm.restartagentwhenfakedead.description', defaultMessage: `### Restart Hung KVM Agent

Specify whether to restart the KVM agent when it is detected hung. Default: enabled.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.hosts.and.vms', defaultMessage: 'Host and VM'}),
      firstCategoryKey: 'virtualization.hosts.and.vms',
      secondCategory: intl.formatMessage({id: 'virtualization.host', defaultMessage: 'Host'}),
      secondCategoryKey: 'virtualization.host',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.kvm.vm.createConcurrency',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.kvm.vm.createConcurrency', defaultMessage: 'Max Concurrent VM Creations'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.kvm.vm.createConcurrency.description', defaultMessage: `### Max Concurrent VM Creations

Specify the maximum number of virtual machines that can be created concurrently on a single host. Default: 1.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.concurrency.strategy', defaultMessage: 'Concurrency Policy'}),
      secondCategoryKey: 'virtualization.concurrency.strategy',
      formItem: {
        validatorName: 'validKvmVmCreateConcurrency',
        componentProps: { disableNonZhLangUnit: true },
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ge', defaultMessage: ' '})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.kvm.vm.migrationQuantity',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.kvm.vm.migrationQuantity', defaultMessage: 'Max Concurrent VM Migrations'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.kvm.vm.migrationQuantity.description', defaultMessage: `### Max Concurrent VM Migrations

Specify the maximum number of virtual machines that can be migrated concurrently when a host is in maintenance mode. Default: 2.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.concurrency.strategy', defaultMessage: 'Concurrency Policy'}),
      secondCategoryKey: 'virtualization.concurrency.strategy',
      formItem: {
        validatorName: 'validWithinZeroToMaxIntegerRange',
        componentProps: { disableNonZhLangUnit: true },
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ge', defaultMessage: ' '})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.kvm.vmSyncOnHostPing',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.kvm.vmSyncOnHostPing', defaultMessage: 'Sync VM Status on Pinging Host'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.kvm.vmSyncOnHostPing.description', defaultMessage: `### Sync VM Status on Pinging Host

Specify whether to sychronize the virtual machine status while pinging the host. Default: enabled.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.hosts.and.vms', defaultMessage: 'Host and VM'}),
      firstCategoryKey: 'virtualization.hosts.and.vms',
      secondCategory: intl.formatMessage({id: 'virtualization.host', defaultMessage: 'Host'}),
      secondCategoryKey: 'virtualization.host',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.localStoragePrimaryStorage.liveMigrationWithStorage.allow',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.localStoragePrimaryStorage.liveMigrationWithStorage.allow', defaultMessage: 'Change Host Online on Local Storage'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.localStoragePrimaryStorage.liveMigrationWithStorage.allow.description', defaultMessage: `### Change Host Online on Local Storage

Specify whether to enable online changing hosts for virtual machines on a local storage. Default: Enabled. If enabled, virtual machines on a local storage can online change hosts, including Change Host and Change Host and Data Storage.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      firstCategoryKey: 'virtualization.globalConfig.dataStorage',
      secondCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      secondCategoryKey: 'virtualization.globalConfig.dataStorage',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.managementServer.log.delete.accumulatedFileSize',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.managementServer.log.delete.accumulatedFileSize', defaultMessage: 'Management Node Log Retention Size'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.managementServer.log.delete.accumulatedFileSize.description', defaultMessage: `### Management Node Log Retention Size

Specify whether to set the maximum size of locally retained management node logs. Logs exceeding this size will be permanently deleted. Default: disabled. Unit: GB. If disabled, there will be no limit on the log retention size.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.operations.management', defaultMessage: 'O&M Management'}),
      firstCategoryKey: 'virtualization.operations.management',
      secondCategory: intl.formatMessage({id: 'virtualization.monitoring.alarm', defaultMessage: 'Monitoring and Alarm'}),
      secondCategoryKey: 'virtualization.monitoring.alarm',
      formItem: {
        validatorName: 'validLessThanOrEqualToOneWithoutUnit',
        translateValue: 'translateNegativeOneAsUnlimited',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'ManagementServerLogSize',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'globalConfig.unit.GB', defaultMessage: 'GB'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.managementServer.log.delete.lastModified',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.managementServer.log.delete.lastModified', defaultMessage: 'Management Node Log Retention Period'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.managementServer.log.delete.lastModified.description', defaultMessage: `### Management Node Log Retention Period

Specify whether to set the the maximum duration for which management node logs are retained locally. Logs older than this duration will be permanently deleted. Default: disabled. Unit: day. If disabled, there will be no limit on the log retention period.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.operations.management', defaultMessage: 'O&M Management'}),
      firstCategoryKey: 'virtualization.operations.management',
      secondCategory: intl.formatMessage({id: 'virtualization.monitoring.alarm', defaultMessage: 'Monitoring and Alarm'}),
      secondCategoryKey: 'virtualization.monitoring.alarm',
      formItem: {
        validatorName: 'validLessThanOrEqualToOneWithoutUnit',
        translateValue: 'translateNegativeOneAsUnlimited',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'ManagementServerLogLastModified',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'day', defaultMessage: 'days'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.managementServer.node.heartbeatInterval',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.managementServer.node.heartbeatInterval', defaultMessage: 'Heartbeat Inspection Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.managementServer.node.heartbeatInterval.description', defaultMessage: `### Heartbeat Inspection Interval

Specify the time interval at which the management node writes its heartbeat pulses to the database. Default: 5. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.management.node.policy', defaultMessage: 'Management Node Policy'}),
      secondCategoryKey: 'virtualization.management.node.policy',
      formItem: {
        validatorName: 'validWithinZeroToMaxIntegerRange',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.mevoco.deleteTempImages',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.mevoco.deleteTempImages', defaultMessage: 'Auto Delete Temporary Image'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.mevoco.deleteTempImages.description', defaultMessage: `### Auto Delete Temporary Image

Specify whether to automatically delete temporary images generated while cloning virtual machines. Default: enabled.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.image.storage', defaultMessage: 'Image Storage'}),
      firstCategoryKey: 'virtualization.image.storage',
      secondCategory: intl.formatMessage({id: 'virtualization.image', defaultMessage: 'Image'}),
      secondCategoryKey: 'virtualization.image',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.mevoco.distributeImage',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.mevoco.distributeImage', defaultMessage: 'Distribute Image'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.mevoco.distributeImage.description', defaultMessage: `### Distribute Image

Specify whether to distribute newly added images to all hosts within the cluster to which the local storage is attached. Default: enabled.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.image.storage', defaultMessage: 'Image Storage'}),
      firstCategoryKey: 'virtualization.image.storage',
      secondCategory: intl.formatMessage({id: 'virtualization.image', defaultMessage: 'Image'}),
      secondCategoryKey: 'virtualization.image',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.mevoco.distributeImage.concurrency',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.mevoco.distributeImage.concurrency', defaultMessage: 'Concurrent Image Distribution to Local Storage'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.mevoco.distributeImage.concurrency.description', defaultMessage: `### Concurrent Image Distribution to Local Storage

Specify the maximum number of images that can be concurrently distributed to local storage after adding an image. Default: 2.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.concurrency.strategy', defaultMessage: 'Concurrency Policy'}),
      secondCategoryKey: 'virtualization.concurrency.strategy',
      formItem: {
        validatorName: 'validWithinZeroToMaxIntegerRange',
        componentProps: { disableNonZhLangUnit: true },
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ge', defaultMessage: ' '})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.mevoco.threshold.primaryStorage.physicalCapacity',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.mevoco.threshold.primaryStorage.physicalCapacity', defaultMessage: 'Data Storage Utilization Threshold'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.mevoco.threshold.primaryStorage.physicalCapacity.description', defaultMessage: `### Data Storage Utilization Threshold

Specify a threshold for data storage utilization to prevent overuse of storage space.This is particularly important when storage overcommitment is enabled, as excessive allocation can lead to storage overflow and cause virtual machine storage failures. Default: 0.9.

Note: When the data storage usage reaches the set threshold, the system will prohibit adding new disks. Existing disks are not affected and work as expected.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      firstCategoryKey: 'virtualization.globalConfig.dataStorage',
      secondCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      secondCategoryKey: 'virtualization.globalConfig.dataStorage',
      alertMessage: intl.formatMessage({id: 'globalConfig.virtualization.mevoco.threshold.primaryStorage.physicalCapacity.alert', defaultMessage: `Range of values: A decimal number between (0, 1] with a maximum of four digits.`}),
      formItem: {
        validatorName: 'validPSCapacity',
        componentProps: {
  step: 0.0001,
  precision: 4
},
        inputType: 'InputWithNumber',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.monitoring.trigger.recovery.checker.interval',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.monitoring.trigger.recovery.checker.interval', defaultMessage: 'Trigger Recovery Check Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.monitoring.trigger.recovery.checker.interval.description', defaultMessage: `### Trigger Recovery Check Interval

Specify the time interval at which the system periodically checks whether a trigger has recovered. Default: 10. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.operations.management', defaultMessage: 'O&M Management'}),
      firstCategoryKey: 'virtualization.operations.management',
      secondCategory: intl.formatMessage({id: 'virtualization.monitoring.alarm', defaultMessage: 'Monitoring and Alarm'}),
      secondCategoryKey: 'virtualization.monitoring.alarm',
      formItem: {
        validatorName: 'validOneSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.networkService.defaultDhcpMtu.l2NoVlanNetwork',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.networkService.defaultDhcpMtu.l2NoVlanNetwork', defaultMessage: 'Distributed Switch NoVLAN Network MTU'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.networkService.defaultDhcpMtu.l2NoVlanNetwork.description', defaultMessage: `### Distributed Switch NoVLAN Network MTU

Specify the maximum packet size that can be transmitted over a NoVLAN network. Default: 1,500. Unit: byte.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.network.resources', defaultMessage: 'Network Resources'}),
      firstCategoryKey: 'virtualization.network.resources',
      secondCategory: intl.formatMessage({id: 'virtualization.Distributed.Switch', defaultMessage: 'Distributed Switch'}),
      secondCategoryKey: 'virtualization.Distributed.Switch',
      formItem: {
        validatorName: 'validL2networkDefaultDhcpMtu',
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'globalConfig.unit.Byte', defaultMessage: 'Byte'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.networkService.defaultDhcpMtu.l2VlanNetwork',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.networkService.defaultDhcpMtu.l2VlanNetwork', defaultMessage: 'Distributed Switch VLAN Network MTU'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.networkService.defaultDhcpMtu.l2VlanNetwork.description', defaultMessage: `### Distributed Switch VLAN Network MTU

Specify the maximum packet size that can be transmitted over a VLAN network. Default: 1,500. Unit: byte.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.network.resources', defaultMessage: 'Network Resources'}),
      firstCategoryKey: 'virtualization.network.resources',
      secondCategory: intl.formatMessage({id: 'virtualization.Distributed.Switch', defaultMessage: 'Distributed Switch'}),
      secondCategoryKey: 'virtualization.Distributed.Switch',
      formItem: {
        validatorName: 'validL2networkDefaultDhcpMtu',
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'globalConfig.unit.Byte', defaultMessage: 'Byte'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.premiumHostAllocator.minimumCPUUsageHostAllocatorStrategy.collectHostDataDuration',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.premiumHostAllocator.minimumCPUUsageHostAllocatorStrategy.collectHostDataDuration', defaultMessage: 'Host CPU Utilization Collection Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.premiumHostAllocator.minimumCPUUsageHostAllocatorStrategy.collectHostDataDuration.description', defaultMessage: `### Host CPU Utilization Collection Interval

Specify the time interval at which the CPU utilization of hosts is collected. The system uses this data to select the host with the lowest CPU utilization for creating new virtual machines. Default: 600. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.hosts.and.vms', defaultMessage: 'Host and VM'}),
      firstCategoryKey: 'virtualization.hosts.and.vms',
      secondCategory: intl.formatMessage({id: 'virtualization.host', defaultMessage: 'Host'}),
      secondCategoryKey: 'virtualization.host',
      formItem: {
        validatorName: 'validCollectHostDataDuration',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.premiumHostAllocator.minimumMemoryUsageHostAllocatorStrategy.collectHostDataDuration',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.premiumHostAllocator.minimumMemoryUsageHostAllocatorStrategy.collectHostDataDuration', defaultMessage: 'Host Memory Utilization Collection Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.premiumHostAllocator.minimumMemoryUsageHostAllocatorStrategy.collectHostDataDuration.description', defaultMessage: `### Host Memory Utilization Collection Interval

Specify the time interval at which the memory utilization of hosts is collected. The system uses this data to select the host with the lowest memory utilization for creating new virtual machines. Default: 600. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.hosts.and.vms', defaultMessage: 'Host and VM'}),
      firstCategoryKey: 'virtualization.hosts.and.vms',
      secondCategory: intl.formatMessage({id: 'virtualization.host', defaultMessage: 'Host'}),
      secondCategoryKey: 'virtualization.host',
      formItem: {
        validatorName: 'validCollectHostDataDuration',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.primaryStorage.imageCache.garbageCollector.interval',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.primaryStorage.imageCache.garbageCollector.interval', defaultMessage: 'Non-Distributed Storage Image Cache Cleanup Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.primaryStorage.imageCache.garbageCollector.interval.description', defaultMessage: `### Non-Distributed Storage Image Cache Cleanup Interval

The interval of cleaning image cache from non-distributed storage. This setting is applied after images in data storage (non-distributed storage) are deleted and image caches are no longer used by any virtual machines. Default: 86,400. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      firstCategoryKey: 'virtualization.globalConfig.dataStorage',
      secondCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      secondCategoryKey: 'virtualization.globalConfig.dataStorage',
      formItem: {
        validatorName: 'validOneSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.primaryStorage.ping.interval',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.primaryStorage.ping.interval', defaultMessage: 'Data Storage Ping Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.primaryStorage.ping.interval.description', defaultMessage: `### Data Storage Ping Interval

Specify the time interval at which the management node checks the connectivity of the data storage. Default: 60. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.management.node.policy', defaultMessage: 'Management Node Policy'}),
      secondCategoryKey: 'virtualization.management.node.policy',
      formItem: {
        validatorName: 'validWithinZeroToMaxIntegerRange',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.primaryStorage.ping.parallelismDegree',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.primaryStorage.ping.parallelismDegree', defaultMessage: 'Data Storage Ping Max Concurrency'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.primaryStorage.ping.parallelismDegree.description', defaultMessage: `### Data Storage Ping Max Concurrency

Specify the maximum number of data storage checks that can be performed concurrently by the management node. Default: 50.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.concurrency.strategy', defaultMessage: 'Concurrency Policy'}),
      secondCategoryKey: 'virtualization.concurrency.strategy',
      formItem: {
        validatorName: 'validWithinZeroToMaxIntegerRange',
        componentProps: { disableNonZhLangUnit: true },
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ge', defaultMessage: ' '})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.primaryStorage.primarystorage.delete.bits.garbage.on',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.primaryStorage.primarystorage.delete.bits.garbage.on', defaultMessage: 'Data Storage Garbage Collection'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.primaryStorage.primarystorage.delete.bits.garbage.on.description', defaultMessage: `### Data Storage Garbage Collection

Specify whether to enable automatic garbage collection on the data storage after failed attempts to create virtual machines or disks. Default: enabled.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.cleanUp.strategy', defaultMessage: 'Cleanup Policy'}),
      secondCategoryKey: 'virtualization.cleanUp.strategy',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.primaryStorage.primarystorage.delete.bits.garbageCollector.interval',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.primaryStorage.primarystorage.delete.bits.garbageCollector.interval', defaultMessage: 'Data Storage Garbage Collection Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.primaryStorage.primarystorage.delete.bits.garbageCollector.interval.description', defaultMessage: `### Data Storage Garbage Collection Interval

Specify the time interval for garbage collection on the data storage. Default: 600. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.cleanUp.strategy', defaultMessage: 'Cleanup Policy'}),
      secondCategoryKey: 'virtualization.cleanUp.strategy',
      formItem: {
        validatorName: 'validZeroSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.primaryStorage.primarystorage.delete.bits.times',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.primaryStorage.primarystorage.delete.bits.times', defaultMessage: 'Data Storage Garbage Collection Frequency'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.primaryStorage.primarystorage.delete.bits.times.description', defaultMessage: `### Data Storage Garbage Collection Frequency

Specify the number of times the garbage collection will be repeated on the data storage. Default: 50.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.cleanUp.strategy', defaultMessage: 'Cleanup Policy'}),
      secondCategoryKey: 'virtualization.cleanUp.strategy',
      formItem: {
        validatorName: 'validZeroTimes',
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ci', defaultMessage: 'times'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.primaryStorage.reservedCapacity',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.primaryStorage.reservedCapacity', defaultMessage: 'Data Storage Reserved Capacity'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.primaryStorage.reservedCapacity.description', defaultMessage: `### Data Storage Reserved Capacity

Specify a reserved space for data storage. Default: 1GB. Unit: KB, MB, GB, and TB.

- For local storage and distributed storage, note that the system will set this reserved capacity for each storage pool (i.e., the actual effective reserved capacity = the specified reserved capacity value × number of storage pools). Please set a reasonable value to avoid exceeding the total physical data storage capacity.
- For other storage, the reserved capacity is set to the specified value.

Note: The reserved capacity of data storage does not affect the normal read/write operations of existing disks.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      firstCategoryKey: 'virtualization.globalConfig.dataStorage',
      secondCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      secondCategoryKey: 'virtualization.globalConfig.dataStorage',
      alertMessage: intl.formatMessage({id: 'globalConfig.virtualization.primaryStorage.reservedCapacity.alert', defaultMessage: `Range: 1024 bytes - 1024 terabytes, Unit: KB, MB, GB, TB`}),
      formItem: {
        validatorName: 'validReservedCapacity',
        translateValue: 'translateStorageValueWithComputerStorageUnit',
        formatFunction: 'formatUnitWithUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: 'K',
            displayName: intl.formatMessage({id: 'globalConfig.unit.KB', defaultMessage: 'KB'})
          },
          {
            value: 'M',
            displayName: intl.formatMessage({id: 'globalConfig.unit.MB', defaultMessage: 'MB'})
          },
          {
            value: 'G',
            displayName: intl.formatMessage({id: 'globalConfig.unit.GB', defaultMessage: 'GB'})
          },
          {
            value: 'T',
            displayName: intl.formatMessage({id: 'globalConfig.unit.TB', defaultMessage: 'TB'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.progress.progress.cleanupThreadInterval',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.progress.progress.cleanupThreadInterval', defaultMessage: 'Progress Bar Record Cleanup Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.progress.progress.cleanupThreadInterval.description', defaultMessage: `### Progress Bar Record Cleanup Interval

Specify the time interval for automatically cleaning up expired progress bar records. Default: 300. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.cleanUp.strategy', defaultMessage: 'Cleanup Policy'}),
      secondCategoryKey: 'virtualization.cleanUp.strategy',
      formItem: {
        validatorName: 'validOneSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.progress.progress.on',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.progress.progress.on', defaultMessage: 'Progress Bar'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.progress.progress.on.description', defaultMessage: `### Progress Bar

Specify whether to show progress bar when performing an operation. Default: enabled.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.progress.bar', defaultMessage: 'Progress Bar'}),
      secondCategoryKey: 'virtualization.progress.bar',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.progress.progress.ttl',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.progress.progress.ttl', defaultMessage: 'Progress Bar Data Retention Period'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.progress.progress.ttl.description', defaultMessage: `### Progress Bar Data Retention Period

Specify the maximum duration for which progress bar data is retained in the database. Default: 86,400 seconds. Unit: second, minute, hour, and day.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.progress.bar', defaultMessage: 'Progress Bar'}),
      secondCategoryKey: 'virtualization.progress.bar',
      formItem: {
        validatorName: 'validZeroSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatTimeToSec',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: 's',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
          {
            value: 'm',
            displayName: intl.formatMessage({id: 'minute', defaultMessage: 'minutes'})
          },
          {
            value: 'h',
            displayName: intl.formatMessage({id: 'hour', defaultMessage: 'hours'})
          },
          {
            value: 'd',
            displayName: intl.formatMessage({id: 'day', defaultMessage: 'days'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.prometheus.storage.local.retention',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.prometheus.storage.local.retention', defaultMessage: 'Monitoring Data Retention Period'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.prometheus.storage.local.retention.description', defaultMessage: `### Monitoring Data Retention Period

Specify the maximum duration for locally retained monitoring data. Default: 6. Unit: month. Valid values: 1 to 12.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.operations.management', defaultMessage: 'O&M Management'}),
      firstCategoryKey: 'virtualization.operations.management',
      secondCategory: intl.formatMessage({id: 'virtualization.monitoring.alarm', defaultMessage: 'Monitoring and Alarm'}),
      secondCategoryKey: 'virtualization.monitoring.alarm',
      formItem: {
        validatorName: 'validRangeMonth',
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'month', defaultMessage: 'months'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.prometheus.storage.local.retention.size',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.prometheus.storage.local.retention.size', defaultMessage: 'Monitoring Data Retention Size'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.prometheus.storage.local.retention.size.description', defaultMessage: `### Monitoring Data Retention Size

Specify the maximum size of locally retained monitoring data. Default: 64GB. Unit: MB, GB, and TB. You can enter an integer that is greater than 1 and is the power of 2.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.operations.management', defaultMessage: 'O&M Management'}),
      firstCategoryKey: 'virtualization.operations.management',
      secondCategory: intl.formatMessage({id: 'virtualization.monitoring.alarm', defaultMessage: 'Monitoring and Alarm'}),
      secondCategoryKey: 'virtualization.monitoring.alarm',
      formItem: {
        validatorName: 'validIsPowerOfTwo',
        translateValue: 'translateStorageValueWithUnit',
        formatFunction: 'formatUnitWithUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: 'MB',
            displayName: intl.formatMessage({id: 'globalConfig.unit.MB', defaultMessage: 'MB'})
          },
          {
            value: 'GB',
            displayName: intl.formatMessage({id: 'globalConfig.unit.GB', defaultMessage: 'GB'})
          },
          {
            value: 'TB',
            displayName: intl.formatMessage({id: 'globalConfig.unit.TB', defaultMessage: 'TB'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.prometheus.storage.tsdb.min-block-duration',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.prometheus.storage.tsdb.min-block-duration', defaultMessage: 'WAL Refresh Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.prometheus.storage.tsdb.min-block-duration.description', defaultMessage: `### WAL Refresh Interval

Specify the time interval of refreshing Write Ahead Logs (WAL). Default: 2 hours. Unit: minute, hour, and day. If the monitoring data size is too large, it is recommended to set this interval to 30 minutes.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.operations.management', defaultMessage: 'O&M Management'}),
      firstCategoryKey: 'virtualization.operations.management',
      secondCategory: intl.formatMessage({id: 'virtualization.monitoring.alarm', defaultMessage: 'Monitoring and Alarm'}),
      secondCategoryKey: 'virtualization.monitoring.alarm',
      formItem: {
        validatorName: 'validOneSeconds',
        translateValue: 'translateMillisecondTimeOrWithUnit',
        formatFunction: 'formatUnitWithUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: 'm',
            displayName: intl.formatMessage({id: 'minute', defaultMessage: 'minutes'})
          },
          {
            value: 'h',
            displayName: intl.formatMessage({id: 'hour', defaultMessage: 'hours'})
          },
          {
            value: 'd',
            displayName: intl.formatMessage({id: 'day', defaultMessage: 'days'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.rest.checkTimeZone',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.rest.checkTimeZone', defaultMessage: 'Check Time Zone in REST API Calls'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.rest.checkTimeZone.description', defaultMessage: `### Check Time Zone in REST API Calls

Specify whether to enable the time zone check when making REST API calls. Deafult: disabled. If enabled, the system will recognize and validate the time zone during API requests. If disabled, the system will only compare local times without considering time zones.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.management.node.policy', defaultMessage: 'Management Node Policy'}),
      secondCategoryKey: 'virtualization.management.node.policy',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.securityGroup.egress.defaultPolicy',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.securityGroup.egress.defaultPolicy', defaultMessage: 'Default Egress Policy of Security Group'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.securityGroup.egress.defaultPolicy.description', defaultMessage: `### Default Egress Policy of Security Group

Specify the default egress policy of security groups. Default: accept. Valid values: accept and deny.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.network.resources', defaultMessage: 'Network Resources'}),
      firstCategoryKey: 'virtualization.network.resources',
      secondCategory: intl.formatMessage({id: 'virtualization.Security.Group', defaultMessage: 'Security Group'}),
      secondCategoryKey: 'virtualization.Security.Group',
      formItem: {
        inputType: 'Select',
        unitList: [
        ],
        selectList: [
          {
            value: 'accept',
            displayName: intl.formatMessage({id: 'globalConfig.accept', defaultMessage: 'accept'})
          },
          {
            value: 'deny',
            displayName: intl.formatMessage({id: 'globalConfig.deny', defaultMessage: 'deny'})
          },
        ]
      }
    },
    {
      key: 'virtualization.securityGroup.ingress.defaultPolicy',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.securityGroup.ingress.defaultPolicy', defaultMessage: 'Default Ingress Policy of Security Group'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.securityGroup.ingress.defaultPolicy.description', defaultMessage: `### Default Ingress Policy of Security Group

Specify the default ingress policy of security groups. Default: drop. Valid values: accept, drop, and deny.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.network.resources', defaultMessage: 'Network Resources'}),
      firstCategoryKey: 'virtualization.network.resources',
      secondCategory: intl.formatMessage({id: 'virtualization.Security.Group', defaultMessage: 'Security Group'}),
      secondCategoryKey: 'virtualization.Security.Group',
      formItem: {
        inputType: 'Select',
        unitList: [
        ],
        selectList: [
          {
            value: 'drop',
            displayName: intl.formatMessage({id: 'globalConfig.drop', defaultMessage: 'drop'})
          },
          {
            value: 'accept',
            displayName: intl.formatMessage({id: 'globalConfig.accept', defaultMessage: 'accept'})
          },
          {
            value: 'deny',
            displayName: intl.formatMessage({id: 'globalConfig.deny', defaultMessage: 'deny'})
          },
        ]
      }
    },
    {
      key: 'virtualization.sharedblock.deletion.gcInterval',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.sharedblock.deletion.gcInterval', defaultMessage: 'Failed Disk/Snapshot Cleanup Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.sharedblock.deletion.gcInterval.description', defaultMessage: `### Failed Disk/Snapshot Cleanup Interval

Specify the time interval for automatically cleaning up failed or invalid disks or snapshots that remain in the SAN storage after deletion attempts. Default: 3,600. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.cleanUp.strategy', defaultMessage: 'Cleanup Policy'}),
      secondCategoryKey: 'virtualization.cleanUp.strategy',
      formItem: {
        validatorName: 'validOneSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.sharedblock.fail.if.multipath.no.path',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.sharedblock.fail.if.multipath.no.path', defaultMessage: 'Disable queue_if_no_path for Multipath Device'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.sharedblock.fail.if.multipath.no.path.description', defaultMessage: `### Disable queue_if_no_path for Multipath Device

Specify whether to disable the queue_if_no_path feature for multipath devices. Default: enabled. The system will return I/O failures if all paths to the multipath device used by SAN storage are lost. If disabled, it may impact the reliability of heartbeat detection and failover mechanisms in the platform. Proceed with caution.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      firstCategoryKey: 'virtualization.globalConfig.dataStorage',
      secondCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      secondCategoryKey: 'virtualization.globalConfig.dataStorage',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.sharedblock.thin.provisioning.initialize.size',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.sharedblock.thin.provisioning.initialize.size', defaultMessage: 'Initial Size for Thin-Provisioned Disk'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.sharedblock.thin.provisioning.initialize.size.description', defaultMessage: `### Initial Size for Thin-Provisioned Disk

Specify the initial size of a thin-provisioned disk. Default: 5GB. Unit: MB, GB, and TB. The initial size cannot be lower than 1 GB.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      firstCategoryKey: 'virtualization.globalConfig.dataStorage',
      secondCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      secondCategoryKey: 'virtualization.globalConfig.dataStorage',
      formItem: {
        validatorName: 'validSharedblockInitializeSize',
        translateValue: 'translateStorageValue',
        formatFunction: 'formatUnitWithStorage',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: 'M',
            displayName: intl.formatMessage({id: 'globalConfig.unit.MB', defaultMessage: 'MB'})
          },
          {
            value: 'G',
            displayName: intl.formatMessage({id: 'globalConfig.unit.GB', defaultMessage: 'GB'})
          },
          {
            value: 'T',
            displayName: intl.formatMessage({id: 'globalConfig.unit.TB', defaultMessage: 'TB'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.sharedblock.thin.provisioning.volume.freespace',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.sharedblock.thin.provisioning.volume.freespace', defaultMessage: 'Min Available Space for Thin-Provisioned Disk'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.sharedblock.thin.provisioning.volume.freespace.description', defaultMessage: `### Min Available Space for Thin-Provisioned Disk

Specify the minimum available space threshold for a thin-provisioned disk. When the difference between the actual size of a thin-provisioned disk and the used storage space falls below this threshold, the disk will automatically expand based on a predefined size. Default: 5GB. Unit: MB, GB, and TB.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      firstCategoryKey: 'virtualization.globalConfig.dataStorage',
      secondCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      secondCategoryKey: 'virtualization.globalConfig.dataStorage',
      formItem: {
        validatorName: 'validSharedblockInitializeSize',
        translateValue: 'translateStorageValue',
        formatFunction: 'formatUnitWithStorage',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: 'M',
            displayName: intl.formatMessage({id: 'globalConfig.unit.MB', defaultMessage: 'MB'})
          },
          {
            value: 'G',
            displayName: intl.formatMessage({id: 'globalConfig.unit.GB', defaultMessage: 'GB'})
          },
          {
            value: 'T',
            displayName: intl.formatMessage({id: 'globalConfig.unit.TB', defaultMessage: 'TB'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.sharedblock.thin.provisioning.volume.increment',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.sharedblock.thin.provisioning.volume.increment', defaultMessage: 'Auto Expansion Size for Thin-Provisioned Disk'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.sharedblock.thin.provisioning.volume.increment.description', defaultMessage: `### Auto Expansion Size for Thin-Provisioned Disk

Specify the size by which a thin-provisioned disk will automatically expand. Default: 5GB. Default: MB, GB, and TB.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      firstCategoryKey: 'virtualization.globalConfig.dataStorage',
      secondCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      secondCategoryKey: 'virtualization.globalConfig.dataStorage',
      formItem: {
        validatorName: 'validSharedblockInitializeSize',
        translateValue: 'translateStorageValue',
        formatFunction: 'formatUnitWithStorage',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: 'M',
            displayName: intl.formatMessage({id: 'globalConfig.unit.MB', defaultMessage: 'MB'})
          },
          {
            value: 'G',
            displayName: intl.formatMessage({id: 'globalConfig.unit.GB', defaultMessage: 'GB'})
          },
          {
            value: 'T',
            displayName: intl.formatMessage({id: 'globalConfig.unit.TB', defaultMessage: 'TB'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.sharedblock.thin.provisioning.volume.utilization.percent',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.sharedblock.thin.provisioning.volume.utilization.percent', defaultMessage: 'Max Usage Ratio for Thin-Provisioned Disk'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.sharedblock.thin.provisioning.volume.utilization.percent.description', defaultMessage: `### Max Usage Ratio for Thin-Provisioned Disk

Specify the maximum usage ratio for a thin-provisioned disk. When the actual usage ratio of a thin-provisioned disk exceeds the maximum usage ratio, the disk will automatically expand based on a predefined size. Default: 85. Unit: %.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      firstCategoryKey: 'virtualization.globalConfig.dataStorage',
      secondCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      secondCategoryKey: 'virtualization.globalConfig.dataStorage',
      formItem: {
        validatorName: 'validSharedblockUtilizationPercent',
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'percent', defaultMessage: '%'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.ui.operation.max.history',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.ui.operation.max.history', defaultMessage: 'Operation Task Retention Period'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.ui.operation.max.history.description', defaultMessage: `### Operation Task Retention Period

Specify the maximum duration for retained operation tasks. Operation tasks older than this duration will be permanently deleted. Default: 90. Unit: day.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.operations.management', defaultMessage: 'O&M Management'}),
      firstCategoryKey: 'virtualization.operations.management',
      secondCategory: intl.formatMessage({id: 'virtualization.monitoring.alarm', defaultMessage: 'Monitoring and Alarm'}),
      secondCategoryKey: 'virtualization.monitoring.alarm',
      formItem: {
        validatorName: 'validOneHundredYears',
        translateValue: 'translateMillisecondTimeOrWithUnit',
        formatFunction: 'formatDayToMillisecondTime',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'day', defaultMessage: 'days'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.ui.vm.create.limit.num',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.ui.vm.create.limit.num', defaultMessage: 'Max VMs in UI Batch Creation'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.ui.vm.create.limit.num.description', defaultMessage: `### Max VMs in UI Batch Creation

 Specify the maximum number of virtual machines that can be created in a single batch operation via the UI. Default: 100. Valid values: 1 to 10,000.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.hosts.and.vms', defaultMessage: 'Host and VM'}),
      firstCategoryKey: 'virtualization.hosts.and.vms',
      secondCategory: intl.formatMessage({id: 'virtualization.vm', defaultMessage: 'Virtual Machine'}),
      secondCategoryKey: 'virtualization.vm',
      formItem: {
        validatorName: 'validateUIVmCreateLimitNum',
        componentProps: { disableNonZhLangUnit: true },
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.tai', defaultMessage: ' '})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.userdata.userdata.openServiceByDefault',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.userdata.userdata.openServiceByDefault', defaultMessage: 'User Data Service'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.userdata.userdata.openServiceByDefault.description', defaultMessage: `### User Data Service

Specify whether to enable the User Data service. Default: enabled. If disabled, virtual machines without Userdata settings will not be able to upload internal monitoring data through their agents.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.hosts.and.vms', defaultMessage: 'Host and VM'}),
      firstCategoryKey: 'virtualization.hosts.and.vms',
      secondCategory: intl.formatMessage({id: 'virtualization.vm', defaultMessage: 'Virtual Machine'}),
      secondCategoryKey: 'virtualization.vm',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.vm.deletionPolicy',
      mergeKey: 'vm.deletionPolicy||vm.expungePeriod',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.vm.deletionPolicy', defaultMessage: 'VM Deletion Policy'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.vm.deletionPolicy.description', defaultMessage: `### VM Deletion Policy

Specify whether to completely delete the virtual machine or retain it in the recycle bin when you delete a virtual machine. Default: Delayed Deletion. Options include Immediate Deletion, Delayed Deletion, and Never Delete.

1. Immediate Deletion:
    - The virtual machine is directly expunged as soon as you delete it. An expunged VM cannot be recovered. Proceed with caution.
    - Any virtual machines currently in the Recycle Bin will also be expunged as soon as you apply this policy. Proceed with caution.

2. Delayed Deletion:
    - The virtual machine is moved to the Recycle Bin after deletion. You can specify a retention period during which the virtual machine is retained in Recycle Bin. After the retention period expires, the virtual machine is automatically expunged and cannot be recovered.
    - You can recover a deleted virtual machine from the Recycle Bin before it is automatically expunged.

3. Never Delete:
    - The virtual machine is moved to the Recycle Bin after deletion and will not be automatically expunged. You can recover a deleted virtual machine from the Recycle Bin.
    - Virtual machines in the Recycle Bin can be manually expunged. Once expunged, they cannot be recovered. Proceed with caution.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.delete.policy', defaultMessage: 'Deletion Policy'}),
      secondCategoryKey: 'virtualization.delete.policy',
      alertMessage: intl.formatMessage({id: 'globalConfig.virtualization.vm.deletionPolicy.alert', defaultMessage: `Value Range: 1 hour to 30 days...`}),
      formItem: {
        translateValue: 'translateDeletePolicy',
        inputType: 'DeletionPolicy',
        unitList: [
        ],
        selectList: [
          {
            value: 'Delay',
            displayName: intl.formatMessage({id: 'globalConfig.deletionPolicy.Delay', defaultMessage: 'Delayed Deletion'})
          },
          {
            value: 'Direct',
            displayName: intl.formatMessage({id: 'globalConfig.deletionPolicy.Direct', defaultMessage: 'Immediate Deletion'})
          },
          {
            value: 'Never',
            displayName: intl.formatMessage({id: 'globalConfig.deletionPolicy.Never', defaultMessage: 'Never Delete'})
          },
        ]
      }
    },
    {
      key: 'virtualization.vm.expungeInterval',
      mergeKey: 'vm.expungeInterval||image.expungeInterval||volume.expungeInterval',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.vm.expungeInterval', defaultMessage: 'Recycle Bin Expired Resources Cleanup Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.vm.expungeInterval.description', defaultMessage: `### Recycle Bin Expired Resources Cleanup Interval

Specify the time interval for automatic cleanup of expired resources in the recycle bin. Default: 1 hour. Unit: hour. The interval can be set as an integer between 1 and 24. When resources under the delayed deletion policy reach their preset retention time in the recycle bin, the system will check for expired resources at the specified interval and automatically clean them up.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.cleanUp.strategy', defaultMessage: 'Cleanup Policy'}),
      secondCategoryKey: 'virtualization.cleanUp.strategy',
      formItem: {
        validatorName: 'validExpungeInterval',
        translateValue: 'translateExpungeInterval',
        formatFunction: 'formatTimeToSec',
        inputType: 'ExpungeInterval',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'hour', defaultMessage: 'hours'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.vm.expungePeriod',
      mergeKey: 'vm.deletionPolicy||vm.expungePeriod',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.vm.expungePeriod', defaultMessage: 'Instance Deletion Strategy'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.vm.expungePeriod.description', defaultMessage: `Default is 'Delete after delay', used to set the deletion strategy for virtual machines and elastic bare metal instances. Optional strategies include: Delete immediately, Delete after delay, Never delete.

    Delete immediately: When a user deletes a virtual machine or elastic bare metal instance, these resources will be deleted immediately.

    Delete after delay: When a user deletes a virtual machine or elastic bare metal instance, these resources will be marked as deleted and displayed in the corresponding deleted tab. They will only be permanently deleted after the delay period (default is 9 days) has expired or when the user manually forces deletion.

    Never delete: When a user deletes a virtual machine or elastic bare metal instance, these resources will never be automatically deleted by the system.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.delete.policy', defaultMessage: 'Deletion Policy'}),
      secondCategoryKey: 'virtualization.delete.policy',
      alertMessage: intl.formatMessage({id: 'globalConfig.virtualization.vm.expungePeriod.alert', defaultMessage: `Range: 1 hour to 30 days.`}),
      formItem: {
        validatorName: 'validDeletePolicySeconds',
        translateValue: 'translateDeletePolicy',
        formatFunction: 'formatTimeToSec',
        inputType: 'DeletionPolicy',
        unitList: [
          {
            value: 's',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
          {
            value: 'm',
            displayName: intl.formatMessage({id: 'minute', defaultMessage: 'minutes'})
          },
          {
            value: 'h',
            displayName: intl.formatMessage({id: 'hour', defaultMessage: 'hours'})
          },
          {
            value: 'd',
            displayName: intl.formatMessage({id: 'day', defaultMessage: 'days'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.vm.maximumCdRomNum',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.vm.maximumCdRomNum', defaultMessage: 'Max CD/DVD Drives per VM'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.vm.maximumCdRomNum.description', defaultMessage: `### Max CD/DVD Drives per VM

Specify the maximum number of CD/DVD drives that a virtual machine can create. Default: 3. Valid values: 1, 2, and 3. Note that this setting does not take effect on virtual machines that already have more virtual CD/DVD drives than the specified limit.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.hosts.and.vms', defaultMessage: 'Host and VM'}),
      firstCategoryKey: 'virtualization.hosts.and.vms',
      secondCategory: intl.formatMessage({id: 'virtualization.vm', defaultMessage: 'Virtual Machine'}),
      secondCategoryKey: 'virtualization.vm',
      formItem: {
        translateValue: 'translateSelectValue',
        inputType: 'Select',
        unitList: [
        ],
        selectList: [
          {
            value: '1',
            displayName: intl.formatMessage({id: 'globalConfig.select.one', defaultMessage: '1'})
          },
          {
            value: '2',
            displayName: intl.formatMessage({id: 'globalConfig.select.two', defaultMessage: '2'})
          },
          {
            value: '3',
            displayName: intl.formatMessage({id: 'globalConfig.select.three', defaultMessage: '3'})
          },
        ]
      }
    },
    {
      key: 'virtualization.volume.deletionPolicy',
      mergeKey: 'volume.deletionPolicy||volume.expungePeriod',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.volume.deletionPolicy', defaultMessage: 'Disk Deletion Policy'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.volume.deletionPolicy.description', defaultMessage: `### Disk Deletion Policy

Specify the deletion policy for disks. Default: Delayed Deletion. Options include Immediate Deletion, Delayed Deletion, and Never Delete. When selecting Delayed Deletion, the default retention period is 86,400 seconds. Unit: second, minute, hour, and day.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.delete.policy', defaultMessage: 'Deletion Policy'}),
      secondCategoryKey: 'virtualization.delete.policy',
      formItem: {
        translateValue: 'translateDeletePolicy',
        inputType: 'DeletionPolicy',
        unitList: [
        ],
        selectList: [
          {
            value: 'Delay',
            displayName: intl.formatMessage({id: 'globalConfig.deletionPolicy.Delay', defaultMessage: 'Delayed Deletion'})
          },
          {
            value: 'Direct',
            displayName: intl.formatMessage({id: 'globalConfig.deletionPolicy.Direct', defaultMessage: 'Immediate Deletion'})
          },
          {
            value: 'Never',
            displayName: intl.formatMessage({id: 'globalConfig.deletionPolicy.Never', defaultMessage: 'Never Delete'})
          },
        ]
      }
    },
    {
      key: 'virtualization.volume.expungeInterval',
      mergeKey: 'vm.expungeInterval||image.expungeInterval||volume.expungeInterval',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.volume.expungeInterval', defaultMessage: 'Recycle Bin Expired Resources Cleanup Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.volume.expungeInterval.description', defaultMessage: `### Recycle Bin Expired Resources Cleanup Interval

Specify the time interval for automatic cleanup of expired resources in the recycle bin. Default: 1 hour. Unit: hour. The interval can be set as an integer between 1 and 24. When resources under the delayed deletion policy reach their preset retention time in the recycle bin, the system will check for expired resources at the specified interval and automatically clean them up.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.cleanUp.strategy', defaultMessage: 'Cleanup Policy'}),
      secondCategoryKey: 'virtualization.cleanUp.strategy',
      formItem: {
        validatorName: 'validExpungeInterval',
        translateValue: 'translateExpungeInterval',
        formatFunction: 'formatTimeToSec',
        inputType: 'ExpungeInterval',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'hour', defaultMessage: 'hours'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.volume.expungePeriod',
      mergeKey: 'volume.deletionPolicy||volume.expungePeriod',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.volume.expungePeriod', defaultMessage: 'Disk Deletion Policy'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.volume.expungePeriod.description', defaultMessage: `### Disk Deletion Policy

Specify the deletion policy for disks. Default: Delayed Deletion. Options include Immediate Deletion, Delayed Deletion, and Never Delete. When selecting Delayed Deletion, the default retention period is 86,400 seconds. Unit: second, minute, hour, and day.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.delete.policy', defaultMessage: 'Deletion Policy'}),
      secondCategoryKey: 'virtualization.delete.policy',
      alertMessage: intl.formatMessage({id: 'globalConfig.virtualization.volume.expungePeriod.alert', defaultMessage: `Range: 1 hour to 30 days.`}),
      formItem: {
        validatorName: 'validDeletePolicySeconds',
        translateValue: 'translateDeletePolicy',
        formatFunction: 'formatTimeToSec',
        inputType: 'DeletionPolicy',
        unitList: [
          {
            value: 's',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
          {
            value: 'm',
            displayName: intl.formatMessage({id: 'minute', defaultMessage: 'minutes'})
          },
          {
            value: 'h',
            displayName: intl.formatMessage({id: 'hour', defaultMessage: 'hours'})
          },
          {
            value: 'd',
            displayName: intl.formatMessage({id: 'day', defaultMessage: 'days'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.volume.physical.block.size',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.volume.physical.block.size', defaultMessage: 'Physical I/O Block Size'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.volume.physical.block.size.description', defaultMessage: `### Physical I/O Block Size

Specify the size of the physical I/O block that a disk reports to the Hypervisor. Default: 0. Unit: byte. Valid values: 0, 512, and 4096.

Note:

- The value 0 indicates that the size of physical I/O block that a disk takes up is not limited.
- This parameter only takes effect on ZCE distributed storage.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      firstCategoryKey: 'virtualization.globalConfig.dataStorage',
      secondCategory: intl.formatMessage({id: 'virtualization.volume', defaultMessage: 'Disk'}),
      secondCategoryKey: 'virtualization.volume',
      formItem: {
        translateValue: 'translateSelectValue',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'Select',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'globalConfig.unit.Byte', defaultMessage: 'Byte'})
          },
        ],
        selectList: [
          {
            value: '0',
            displayName: intl.formatMessage({id: 'globalConfig.0Byte', defaultMessage: '0'})
          },
          {
            value: '512',
            displayName: intl.formatMessage({id: 'globalConfig.512Byte', defaultMessage: '512'})
          },
          {
            value: '4096',
            displayName: intl.formatMessage({id: 'globalConfig.4096Byte', defaultMessage: '4096'})
          },
        ]
      }
    },
    {
      key: 'virtualization.volume.refreshVolumeSizeInterval',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.volume.refreshVolumeSizeInterval', defaultMessage: 'Disk Capacity Refresh Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.volume.refreshVolumeSizeInterval.description', defaultMessage: `### Disk Capacity Refresh Interval

Specify the time interval at which the available space on disks is updated. Default: 3,600. Unit: second. The minimum interval cannot be set lower than 600 seconds.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      firstCategoryKey: 'virtualization.globalConfig.dataStorage',
      secondCategory: intl.formatMessage({id: 'virtualization.volume', defaultMessage: 'Disk'}),
      secondCategoryKey: 'virtualization.volume',
      formItem: {
        validatorName: 'validVolumeRefreshVolumeSizeInterval',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.zwatch.alarm.repeatInterval',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.zwatch.alarm.repeatInterval', defaultMessage: 'Alarm Suppression Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.zwatch.alarm.repeatInterval.description', defaultMessage: `### Alarm Suppression Interval

Specify the time inteval during which the alarm will not be triggered again after the initial alert. Default: 1,800. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.operations.management', defaultMessage: 'O&M Management'}),
      firstCategoryKey: 'virtualization.operations.management',
      secondCategory: intl.formatMessage({id: 'virtualization.monitoring.alarm', defaultMessage: 'Monitoring and Alarm'}),
      secondCategoryKey: 'virtualization.monitoring.alarm',
      formItem: {
        validatorName: 'validZeroSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.zwatch.countCacheExpireSecTime',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.zwatch.countCacheExpireSecTime', defaultMessage: 'Alarm Message Retention Period in Cache'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.zwatch.countCacheExpireSecTime.description', defaultMessage: `### Alarm Message Retention Period in Cache

Specify the maximum duration for which the total count of alarm messages triggered by resource and event alarms is retained in the cache. Default: 10. Unit: second. Within the duration, user queries for the total count of alarm messages will retrieve the cached value directly. If caching is not required, you can set the value to 0.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.operations.management', defaultMessage: 'O&M Management'}),
      firstCategoryKey: 'virtualization.operations.management',
      secondCategory: intl.formatMessage({id: 'virtualization.monitoring.alarm', defaultMessage: 'Monitoring and Alarm'}),
      secondCategoryKey: 'virtualization.monitoring.alarm',
      formItem: {
        validatorName: 'validZwatchCountCacheExpireSecTime',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.zwatch.evaluation.interval',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.zwatch.evaluation.interval', defaultMessage: 'Alarm Inspection Interval'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.zwatch.evaluation.interval.description', defaultMessage: `### Alarm Inspection Interval

Specify the time interval at which an alarm inspects metric items. Default: 10. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.operations.management', defaultMessage: 'O&M Management'}),
      firstCategoryKey: 'virtualization.operations.management',
      secondCategory: intl.formatMessage({id: 'virtualization.monitoring.alarm', defaultMessage: 'Monitoring and Alarm'}),
      secondCategoryKey: 'virtualization.monitoring.alarm',
      formItem: {
        validatorName: 'validOneSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.zwatch.evaluation.threadNum',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.zwatch.evaluation.threadNum', defaultMessage: 'Alarm Inspection Concurrency'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.zwatch.evaluation.threadNum.description', defaultMessage: `### Alarm Inspection Concurrency

Specify the concurrency that an alarm inspects metric items. Default: 5.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.operations.management', defaultMessage: 'O&M Management'}),
      firstCategoryKey: 'virtualization.operations.management',
      secondCategory: intl.formatMessage({id: 'virtualization.monitoring.alarm', defaultMessage: 'Monitoring and Alarm'}),
      secondCategoryKey: 'virtualization.monitoring.alarm',
      formItem: {
        validatorName: 'validZeroIndividual',
        componentProps: { disableNonZhLangUnit: true },
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ge', defaultMessage: ' '})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.zwatch.managementServerDirectoriesToMonitor',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.zwatch.managementServerDirectoriesToMonitor', defaultMessage: 'Management Node Directory Monitored by System Alarm'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.zwatch.managementServerDirectoriesToMonitor.description', defaultMessage: `### Management Node Directory Monitored by System Alarm

Specify the management node directory monitored by the system alarm.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.operations.management', defaultMessage: 'O&M Management'}),
      firstCategoryKey: 'virtualization.operations.management',
      secondCategory: intl.formatMessage({id: 'virtualization.monitoring.alarm', defaultMessage: 'Monitoring and Alarm'}),
      secondCategoryKey: 'virtualization.monitoring.alarm',
      formItem: {
        validatorName: 'validRequired',
        translateValue: 'translateToAsterisk',
        inputType: 'Text',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.zwatch.minimumCountAmountAllowedAddedToCache',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.zwatch.minimumCountAmountAllowedAddedToCache', defaultMessage: 'Alarm Message Threshold for Caching'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.zwatch.minimumCountAmountAllowedAddedToCache.description', defaultMessage: `### Alarm Message Threshold for Caching

Specify the threshold for the total count of alarm messages triggered by resource and event alarms that can be written to the cache. Default: 150. If the total count of alarm messages equals or exceeds this threshold, the alarm messages are allowed to be cached. If the count is below the threshold, user queries for the total count of alarm messages will retrieve the real-time value directly.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.operations.management', defaultMessage: 'O&M Management'}),
      firstCategoryKey: 'virtualization.operations.management',
      secondCategory: intl.formatMessage({id: 'virtualization.monitoring.alarm', defaultMessage: 'Monitoring and Alarm'}),
      secondCategoryKey: 'virtualization.monitoring.alarm',
      formItem: {
        validatorName: 'validZwatchMinimumCountAmountAllowedAddedToCache',
        componentProps: { disableNonZhLangUnit: true },
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.tiao', defaultMessage: ' '})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.kvm.testSshPortOpenTimeout',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.kvm.testSshPortOpenTimeout', defaultMessage: 'Host SSH Reconnection Timeout'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.kvm.testSshPortOpenTimeout.description', defaultMessage: `### Host SSH Reconnection Timeout

Specify the timeout period for SSH reconnection attempts to a host. If the SSH connection is not established within this period, the reconnection attempt is considered failed. Default: 300. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.hosts.and.vms', defaultMessage: 'Host and VM'}),
      firstCategoryKey: 'virtualization.hosts.and.vms',
      secondCategory: intl.formatMessage({id: 'virtualization.host', defaultMessage: 'Host'}),
      secondCategoryKey: 'virtualization.host',
      formItem: {
        validatorName: 'validaKVMTestSshPortOpenTimeout',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.kvm.enable.host.tcp.connection.check',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.kvm.enable.host.tcp.connection.check', defaultMessage: 'Quick Host Connection Status Detection'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.kvm.enable.host.tcp.connection.check.description', defaultMessage: `### Quick Host Connection Status Detection

Specify whether to enable or disable the quick detection of host connection status. Default: disabled. If enabled, the system will reduce the time interval between connection status checks.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.hosts.and.vms', defaultMessage: 'Host and VM'}),
      firstCategoryKey: 'virtualization.hosts.and.vms',
      secondCategory: intl.formatMessage({id: 'virtualization.host', defaultMessage: 'Host'}),
      secondCategoryKey: 'virtualization.host',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.ui.delete.resource.double.check',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.ui.delete.resource.double.check', defaultMessage: 'Sensitive Operation Confirmation Validation'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.ui.delete.resource.double.check.description', defaultMessage: `### Sensitive Operation Confirmation Validation

Specify whether to require a secondary confirmation for sensitive operations on critical resources. For example, If you delete a virtual machine, the operation requires an input of specific characters to continue. Default: enabled. If disabled, no additional confirmation is required.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.delete.policy', defaultMessage: 'Deletion Policy'}),
      secondCategoryKey: 'virtualization.delete.policy',
      alertMessage: intl.formatMessage({id: 'globalConfig.virtualization.ui.delete.resource.double.check.alert', defaultMessage: `If you close this switch, you can perform sensitive operations on critical resources (e.g., delete a host) without needing to authenticate. Please exercise caution when doing so...`}),
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.mevoco.hostAllocatorStrategy',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.mevoco.hostAllocatorStrategy', defaultMessage: 'Host Allocation Strategy'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.mevoco.hostAllocatorStrategy.description', defaultMessage: `### Host Allocation Strategy

1. Specify the host allocation strategy to be used when creating new virtual machines. Default: Host with min. running VMs.

     - Host with min. running VMs: The host with the minimum number of running virtual machines will be chosen to create virtual machines.
     - Host with min. CPU utilization: The host with the minimum CPU utilization will be chosen to create virtual machines.
    - Host with min. memory utilization: The host with the minimum memory utilization will be chosen to create virtual machines.
    - Host with max. running VMs: The host with the maximum number of running virtual machines will be chosen to create virtual machines. To use this option, you need to set the maximum number of virtual machines that can run on a host. Then, the system chooses the host that meets the requirements to create virtual machines. If no host is available, you would fail to create a virtual machine.
    - Host where the VM located last time: When you restart a stopped virtual machine, the system chooses the host where the VM was running last time. If you start a new virtual machine for the first time, the system chooses a host randomly.
    - Random allocation: The system randomly chooses a host to create virtual machines.

2. If you choose the "Host with min. CPU utilization" or "Host with min. memory utilization" strategy, you can set the interval for collecting the CPU utilization and memory utilization in the system parameters. `}),
      firstCategory: intl.formatMessage({id: 'virtualization.hosts.and.vms', defaultMessage: 'Host and VM'}),
      firstCategoryKey: 'virtualization.hosts.and.vms',
      secondCategory: intl.formatMessage({id: 'virtualization.host', defaultMessage: 'Host'}),
      secondCategoryKey: 'virtualization.host',
      formItem: {
        translateValue: 'translateSelectValue',
        inputType: 'Select',
        unitList: [
        ],
        selectList: [
          {
            value: 'LeastVmPreferredHostAllocatorStrategy',
            displayName: intl.formatMessage({id: 'globalConfig.LeastVmPreferredHostAllocatorStrategy', defaultMessage: 'Host with min. running VMs'})
          },
          {
            value: 'MinimumCPUUsageHostAllocatorStrategy',
            displayName: intl.formatMessage({id: 'globalConfig.MinimumCPUUsageHostAllocatorStrategy', defaultMessage: 'Host with min. CPU utilization'})
          },
          {
            value: 'MinimumMemoryUsageHostAllocatorStrategy',
            displayName: intl.formatMessage({id: 'globalConfig.MinimumMemoryUsageHostAllocatorStrategy', defaultMessage: 'Host with min. memory utilization'})
          },
          {
            value: 'MaxInstancePerHostHostAllocatorStrategy',
            displayName: intl.formatMessage({id: 'globalConfig.MaxInstancePerHostHostAllocatorStrategy', defaultMessage: 'Host with max. running VMs'})
          },
          {
            value: 'LastHostPreferredAllocatorStrategy',
            displayName: intl.formatMessage({id: 'globalConfig.LastHostPreferredAllocatorStrategy', defaultMessage: 'Host where the VM located last time'})
          },
          {
            value: 'DefaultHostAllocatorStrategy',
            displayName: intl.formatMessage({id: 'globalConfig.DefaultHostAllocatorStrategy', defaultMessage: 'Random allocation'})
          },
        ]
      }
    },
    {
      key: 'virtualization.eventlog.expireTimeInDay',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.eventlog.expireTimeInDay', defaultMessage: 'Auto-Scheduling Task Retention Period'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.eventlog.expireTimeInDay.description', defaultMessage: `### Auto-Scheduling Task Retention Period

Specify the maximum duration for retained scheduling tasks. Scheduling tasks older than this duration will be permanently deleted. default: 90. Unit: day.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.operations.management', defaultMessage: 'O&M Management'}),
      firstCategoryKey: 'virtualization.operations.management',
      secondCategory: intl.formatMessage({id: 'virtualization.monitoring.alarm', defaultMessage: 'Monitoring and Alarm'}),
      secondCategoryKey: 'virtualization.monitoring.alarm',
      formItem: {
        validatorName: 'validateIntegerInRangeZeroTo180',
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'day', defaultMessage: 'days'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.volume.refreshVolumeSize.scope',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.volume.refreshVolumeSize.scope', defaultMessage: 'Disk Capacity Refresh Scope'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.volume.refreshVolumeSize.scope.description', defaultMessage: `### Disk Capacity Refresh Scope

Specify the scope of disks that will automatically refresh their capacity information. After setting, the corresponding disks will automatically refresh their capacity based on the configured refresh interval. Default: All Disks.

- All Disks: All disks will be automatically refreshed based on the interval.
- Disks with Alarms: Only those disks with alarms will be automatically refreshed based on the interval.
- No Refresh: No disks will be automatically refreshed.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      firstCategoryKey: 'virtualization.globalConfig.dataStorage',
      secondCategory: intl.formatMessage({id: 'virtualization.volume', defaultMessage: 'Disk'}),
      secondCategoryKey: 'virtualization.volume',
      formItem: {
        translateValue: 'translateSelectValue',
        inputType: 'Select',
        unitList: [
        ],
        selectList: [
          {
            value: 'AllActive',
            displayName: intl.formatMessage({id: 'globalConfig.AllActive', defaultMessage: 'All Disks'})
          },
          {
            value: 'Monitored',
            displayName: intl.formatMessage({id: 'globalConfig.Monitored', defaultMessage: 'Disks with Alarms'})
          },
          {
            value: 'None',
            displayName: intl.formatMessage({id: 'globalConfig.volume.refreshVolumeSize.scope.None', defaultMessage: 'No Refresh'})
          },
        ]
      }
    },
    {
      key: 'virtualization.kvm.webssh.idleTimeout',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.kvm.webssh.idleTimeout', defaultMessage: 'WebShell Session Timeout'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.kvm.webssh.idleTimeout.description', defaultMessage: `### WebShell Session Timeout

Specify the duration for which a WebShell session remains valid.  Default: 1,800. Unit: second.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.platform.strategy', defaultMessage: 'Platform Policy'}),
      firstCategoryKey: 'virtualization.platform.strategy',
      secondCategory: intl.formatMessage({id: 'virtualization.timeout.policy', defaultMessage: 'Timeout Policy'}),
      secondCategoryKey: 'virtualization.timeout.policy',
      formItem: {
        validatorName: 'validZeroSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.storageDevice.enable.multipath',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.storageDevice.enable.multipath', defaultMessage: 'Multipath Access to Data Storage'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.storageDevice.enable.multipath.description', defaultMessage: `### Multipath Access to Data Storage

Specify the control policy of multipath access to data storage.

- Enable: Enable the multipath service of the platform. This service is managed by the management node, and thus you cannot customize the multipath service.
- Disable: Disable the multipath service of the platform. If disabled, only single path access is supported.
- Custom: Enable the multipath service of the platform. In addition, you can customize the multipath service. If you customize the service, the customization prevails over the platform configuration managed by the management node.

Note: If you modify this setting, you need to reconnect a host to make the modification take effect on the host.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      firstCategoryKey: 'virtualization.globalConfig.dataStorage',
      secondCategory: intl.formatMessage({id: 'virtualization.globalConfig.dataStorage', defaultMessage: 'Data Storage'}),
      secondCategoryKey: 'virtualization.globalConfig.dataStorage',
      alertMessage: intl.formatMessage({id: 'globalConfig.virtualization.storageDevice.enable.multipath.alert', defaultMessage: `Reconnect hosts for the modification to take effect.`}),
      formItem: {
        translateValue: 'translateSelectValue',
        inputType: 'Select',
        unitList: [
        ],
        selectList: [
          {
            value: 'enable',
            displayName: intl.formatMessage({id: 'enable', defaultMessage: 'Enable '})
          },
          {
            value: 'disable',
            displayName: intl.formatMessage({id: 'disable', defaultMessage: 'Disable'})
          },
          {
            value: 'ignore',
            displayName: intl.formatMessage({id: 'custom', defaultMessage: 'Custom'})
          },
        ]
      }
    },
    {
      key: 'virtualization.zwatch.audit.retention.duration',
      categoryType: 'Basic',
      name: intl.formatMessage({id: 'globalConfig.virtualization.zwatch.audit.retention.duration', defaultMessage: 'Event Retention Period'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.zwatch.audit.retention.duration.description', defaultMessage: `### Event Retention Period

Specify whether to set the the maximum duration for retained events. Default: unlimited. If enabled, you can set a retention period. The default retention period is 180 days. Events older than this duration will be permanently deleted.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.operations.management', defaultMessage: 'O&M Management'}),
      firstCategoryKey: 'virtualization.operations.management',
      secondCategory: intl.formatMessage({id: 'virtualization.monitoring.alarm', defaultMessage: 'Monitoring and Alarm'}),
      secondCategoryKey: 'virtualization.monitoring.alarm',
      formItem: {
        validatorName: 'validAuditRetentionDuration',
        translateValue: 'translateNegativeOneAsUnlimited',
        inputType: 'AuditRetentionDuration',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'day', defaultMessage: 'days'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'virtualization.vm.vm.metadata.enabled',
      license: 'BasicZSV,BasicXinChuangZSV,ProZSV,ProXinChuangZSV',
      categoryType: 'Advanced',
      name: intl.formatMessage({id: 'globalConfig.virtualization.vm.vm.metadata.enabled', defaultMessage: 'VM Metadata'}),
      description: intl.formatMessage({id: 'globalConfig.virtualization.vm.vm.metadata.enabled.description', defaultMessage: `### VM Metadata

Default: Disabled. When enabled, the system creates an independent metadata file for each virtual machine.

This feature is currently used only for VM registration. If VM registration is not required, it is recommended to keep this feature disabled.`}),
      firstCategory: intl.formatMessage({id: 'virtualization.hosts.and.vms', defaultMessage: 'Host and VM'}),
      firstCategoryKey: 'virtualization.hosts.and.vms',
      secondCategory: intl.formatMessage({id: 'virtualization.vm', defaultMessage: 'Virtual Machine'}),
      secondCategoryKey: 'virtualization.vm',
      formItem: {
        translateValue: 'translateTrueAndFalse',
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
  ]
}

