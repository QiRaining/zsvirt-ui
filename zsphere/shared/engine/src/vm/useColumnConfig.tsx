
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'
import { Constant } from '@zstack/design'
import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'name' | 'description' | 'format' | 'console' | 'uuid' | 'backupDataCount' | 'currentIp' | 'state' | 'schedulingState' | 'cdpTaskStatus' | 'retention.Period' | 'cpuNum' | 'memorySize' | 'totalVolumeSize' | 'cpuAverageUsedUtilization' | 'memoryUsedInPercent' | 'vm.storage.usage' | 'actuallySize' | 'defaultIpv4' | 'defaultIpv6' | 'defaultMac' | 'eip' | 'defaultL3Network' | 'defalutL3NetworkType' | 'hostIp' | 'host' | 'cluster' | 'vCenter' | 'instanceOffering' | 'hypervisorType' | 'securityGroup' | 'architecture' | 'platform' | 'guestOsType' | 'rootVolume' | 'image' | 'volumeCount' | 'healthStatus' | 'metric' | 'portForwarding' | 'vmNicName' | 'vmNics' | 'ha' | 'qemuState' | 'backupTaskType' | 'primaryStorage' | 'tag' | 'lastHost' | 'gpuDeviceSpec' | 'vmCdRoms' | 'status' | 'resourcePriority' | 'backup.status' | 'ovfVmName' | 'ovfSize' | 'vm' | 'export.backupStorage' | 'backupTaskStatus' | 'group' | 'lastBackupJobResult' | 'backupJobState' | 'backupPriority' | 'localBackupCount' | 'localBackupCapacity' | 'shareType' | 'zone' | 'owner' | 'user.group' | 'lastOpDate' | 'createDate' | 'vmGuesttool' | '__action__'

export type IOption<T extends Item> = Array<Omit<IColumnType<T>, 'key'> & { key: IKey }>

function useColumnConfig<T extends Item>(
  options:IOption<T> = []
): ITableListProps<T>['columnConfig'] {
  const intl = useIntl()

  const { getServerTime } = useTime()

  const _columnConfig: ITableListProps<T>['columnConfig'] = useMemo(() => ({
    list: [
      {
        title: intl.formatMessage({ id: 'name', defaultMessage: 'Name' }),
        i18nKey: 'name',
        key: 'name',
        width: 200,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('name', options)?.linkResource || ''
            const val = formatValue('name', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('name', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('name', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap items-center gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'description', defaultMessage: 'Description' }),
        i18nKey: 'description',
        key: 'description',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('description', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('description', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'export.vm.format', defaultMessage: 'Format' }),
        i18nKey: 'export.vm.format',
        key: 'format',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('format', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('format', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'console', defaultMessage: 'Console' }),
        i18nKey: 'console',
        key: 'console',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('console', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('console', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'uuid', defaultMessage: 'UUID' }),
        i18nKey: 'uuid',
        key: 'uuid',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('uuid', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('uuid', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'backupDataCount', defaultMessage: 'Backups' }),
        i18nKey: 'backupDataCount',
        key: 'backupDataCount',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('backupDataCount', options)?.linkResource || ''
            const val = formatValue('backupDataCount', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('backupDataCount', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('backupDataCount', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap items-center gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'currentNetworkIp', defaultMessage: 'Used IP in Current Network' }),
        i18nKey: 'currentNetworkIp',
        key: 'currentIp',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('currentIp', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('currentIp', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'common.state', defaultMessage: 'Status' }),
        i18nKey: 'common.state',
        key: 'state',
        width: 140,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('state', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('state', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'schedulingState', defaultMessage: 'Scheduling Status' }),
        i18nKey: 'schedulingState',
        key: 'schedulingState',
        width: 140,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('schedulingState', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('schedulingState', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'cdpStatus', defaultMessage: 'CDP Status' }),
        i18nKey: 'cdpStatus',
        key: 'cdpTaskStatus',
        width: 100,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('cdpTaskStatus', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('cdpTaskStatus', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'retentionTime', defaultMessage: 'Retention Period' }),
        i18nKey: 'retentionTime',
        key: 'retention.Period',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('retention.Period', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('retention.Period', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'cpu', defaultMessage: 'CPU' }),
        i18nKey: 'cpu',
        key: 'cpuNum',
        width: 100,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('cpuNum', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('cpuNum', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'memory', defaultMessage: 'Memory' }),
        i18nKey: 'memory',
        key: 'memorySize',
        width: 100,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('memorySize', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('memorySize', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'virtualization.storage', defaultMessage: 'Storage' }),
        i18nKey: 'virtualization.storage',
        key: 'totalVolumeSize',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('totalVolumeSize', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('totalVolumeSize', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'cpu.usage', defaultMessage: 'CPU Utilization' }),
        i18nKey: 'cpu.usage',
        key: 'cpuAverageUsedUtilization',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('cpuAverageUsedUtilization', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('cpuAverageUsedUtilization', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'memory.usage', defaultMessage: ' Memory Utilization' }),
        i18nKey: 'memory.usage',
        key: 'memoryUsedInPercent',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('memoryUsedInPercent', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('memoryUsedInPercent', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'storage.usage', defaultMessage: 'Usage Rate' }),
        i18nKey: 'storage.usage',
        key: 'vm.storage.usage',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('vm.storage.usage', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('vm.storage.usage', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'volume.actual.capacity', defaultMessage: 'Volume Actual Size' }),
        i18nKey: 'volume.actual.capacity',
        key: 'actuallySize',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('actuallySize', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('actuallySize', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'defaultIPv4.address', defaultMessage: 'Default IPv4' }),
        i18nKey: 'defaultIPv4.address',
        key: 'defaultIpv4',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('defaultIpv4', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('defaultIpv4', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'defaultIPv6.address', defaultMessage: 'Default IPv6' }),
        i18nKey: 'defaultIPv6.address',
        key: 'defaultIpv6',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('defaultIpv6', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('defaultIpv6', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'defaultMac', defaultMessage: 'Default MAC Address' }),
        i18nKey: 'defaultMac',
        key: 'defaultMac',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('defaultMac', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('defaultMac', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'eip', defaultMessage: 'EIP' }),
        i18nKey: 'eip',
        key: 'eip',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('eip', options)?.linkResource || ''
            const val = formatValue('eip', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('eip', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('eip', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap items-center gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'defaultNetwork', defaultMessage: 'Default Network' }),
        i18nKey: 'defaultNetwork',
        key: 'defaultL3Network',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('defaultL3Network', options)?.linkResource || ''
            const val = formatValue('defaultL3Network', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('defaultL3Network', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('defaultL3Network', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap items-center gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'defalutNetwork.type', defaultMessage: 'Default Network Type' }),
        i18nKey: 'defalutNetwork.type',
        key: 'defalutL3NetworkType',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('defalutL3NetworkType', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('defalutL3NetworkType', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'hostIp', defaultMessage: 'Host IP' }),
        i18nKey: 'hostIp',
        key: 'hostIp',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('hostIp', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('hostIp', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'host', defaultMessage: 'Host' }),
        i18nKey: 'host',
        key: 'host',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('host', options)?.linkResource || ''
            const val = formatValue('host', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('host', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('host', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap items-center gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'cluster', defaultMessage: 'Cluster' }),
        i18nKey: 'cluster',
        key: 'cluster',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('cluster', options)?.linkResource || ''
            const val = formatValue('cluster', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('cluster', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('cluster', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap items-center gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'vcenter', defaultMessage: 'vCenter' }),
        i18nKey: 'vcenter',
        key: 'vCenter',
        width: 200,filters: [],
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('vCenter', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('vCenter', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'instanceOffering', defaultMessage: 'Instance Offering' }),
        i18nKey: 'instanceOffering',
        key: 'instanceOffering',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('instanceOffering', options)?.linkResource || ''
            const val = formatValue('instanceOffering', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('instanceOffering', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('instanceOffering', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap items-center gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'hypervisorType', defaultMessage: 'Hypervisor' }),
        i18nKey: 'hypervisorType',
        key: 'hypervisorType',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('hypervisorType', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('hypervisorType', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'securityGroup', defaultMessage: 'Security Group' }),
        i18nKey: 'securityGroup',
        key: 'securityGroup',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('securityGroup', options)?.linkResource || ''
            const val = formatValue('securityGroup', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('securityGroup', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('securityGroup', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap items-center gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'cpuArchitecture', defaultMessage: 'CPU Architecture' }),
        i18nKey: 'cpuArchitecture',
        key: 'architecture',
        width: 100,filters: [],
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('architecture', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('architecture', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'platform', defaultMessage: 'Platform' }),
        i18nKey: 'platform',
        key: 'platform',
        width: 140,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('platform', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('platform', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'guestOsType', defaultMessage: 'OS' }),
        i18nKey: 'guestOsType',
        key: 'guestOsType',
        width: 140,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('guestOsType', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('guestOsType', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'rootVolume', defaultMessage: 'Root Volume' }),
        i18nKey: 'rootVolume',
        key: 'rootVolume',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('rootVolume', options)?.linkResource || ''
            const val = formatValue('rootVolume', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('rootVolume', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('rootVolume', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap items-center gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'image', defaultMessage: 'Image' }),
        i18nKey: 'image',
        key: 'image',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('image', options)?.linkResource || ''
            const val = formatValue('image', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('image', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('image', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap items-center gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'volumeCount', defaultMessage: 'Disks' }),
        i18nKey: 'volumeCount',
        key: 'volumeCount',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('volumeCount', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('volumeCount', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'healthStatus', defaultMessage: 'Health Status' }),
        i18nKey: 'healthStatus',
        key: 'healthStatus',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('healthStatus', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('healthStatus', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'monitorStatus', defaultMessage: 'Monitoring Status' }),
        i18nKey: 'monitorStatus',
        key: 'metric',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('metric', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('metric', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'portForwarding', defaultMessage: 'Port Forwarding' }),
        i18nKey: 'portForwarding',
        key: 'portForwarding',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('portForwarding', options)?.linkResource || ''
            const val = formatValue('portForwarding', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('portForwarding', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('portForwarding', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap items-center gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'vmNicName', defaultMessage: 'NIC Name' }),
        i18nKey: 'vmNicName',
        key: 'vmNicName',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('vmNicName', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('vmNicName', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'vmNic', defaultMessage: 'NIC' }),
        i18nKey: 'vmNic',
        key: 'vmNics',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('vmNics', options)?.linkResource || ''
            const val = formatValue('vmNics', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('vmNics', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('vmNics', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap items-center gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'high.availability', defaultMessage: 'High Availability' }),
        i18nKey: 'high.availability',
        key: 'ha',
        width: 140,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('ha', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('ha', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'qemuState', defaultMessage: 'QEMU Version State' }),
        i18nKey: 'qemuState',
        key: 'qemuState',
        width: 200,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('qemuState', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('qemuState', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'backupTaskType', defaultMessage: 'Backup Type' }),
        i18nKey: 'backupTaskType',
        key: 'backupTaskType',
        width: 100,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('backupTaskType', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('backupTaskType', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'primaryStorage', defaultMessage: 'Data Storage' }),
        i18nKey: 'primaryStorage',
        key: 'primaryStorage',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('primaryStorage', options)?.linkResource || ''
            const val = formatValue('primaryStorage', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('primaryStorage', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('primaryStorage', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap items-center gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'tag', defaultMessage: 'Tag' }),
        i18nKey: 'tag',
        key: 'tag',
        width: 200,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('tag', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('tag', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'lastHost', defaultMessage: 'Last Host' }),
        i18nKey: 'lastHost',
        key: 'lastHost',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('lastHost', options)?.linkResource || ''
            const val = formatValue('lastHost', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('lastHost', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('lastHost', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap items-center gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'gpuSpec', defaultMessage: 'GPU Specification' }),
        i18nKey: 'gpuSpec',
        key: 'gpuDeviceSpec',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('gpuDeviceSpec', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('gpuDeviceSpec', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'cdRoms', defaultMessage: 'cdRoms' }),
        i18nKey: 'cdRoms',
        key: 'vmCdRoms',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('vmCdRoms', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('vmCdRoms', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'readyStatus', defaultMessage: 'Status' }),
        i18nKey: 'readyStatus',
        key: 'status',
        width: 140,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('status', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('status', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'resourcePriority', defaultMessage: 'Resource Priority' }),
        i18nKey: 'resourcePriority',
        key: 'resourcePriority',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('resourcePriority', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('resourcePriority', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'backupStatus', defaultMessage: 'Backup Status' }),
        i18nKey: 'backupStatus',
        key: 'backup.status',
        width: 140,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('backup.status', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('backup.status', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'ovf.vm.name', defaultMessage: 'Instance' }),
        i18nKey: 'ovf.vm.name',
        key: 'ovfVmName',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ovfVmName', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ovfVmName', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'ovf.size', defaultMessage: 'OVF Size' }),
        i18nKey: 'ovf.size',
        key: 'ovfSize',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ovfSize', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ovfSize', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'vm', defaultMessage: 'Virtual Machine' }),
        i18nKey: 'vm',
        key: 'vm',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('vm', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('vm', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'export.backupStorage', defaultMessage: 'Image Storage' }),
        i18nKey: 'export.backupStorage',
        key: 'export.backupStorage',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('export.backupStorage', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('export.backupStorage', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'backup.task.status', defaultMessage: 'Backup Job State' }),
        i18nKey: 'backup.task.status',
        key: 'backupTaskStatus',
        width: 140,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('backupTaskStatus', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('backupTaskStatus', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'group.path', defaultMessage: 'VM Group' }),
        i18nKey: 'group.path',
        key: 'group',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('group', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('group', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'last.backup.job.result', defaultMessage: 'Last Backup Result' }),
        i18nKey: 'last.backup.job.result',
        key: 'lastBackupJobResult',
        width: 200,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('lastBackupJobResult', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('lastBackupJobResult', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'virtualization.backup.task.status', defaultMessage: 'Backup Job State' }),
        i18nKey: 'virtualization.backup.task.status',
        key: 'backupJobState',
        width: 140,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('backupJobState', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('backupJobState', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'backup.priority', defaultMessage: 'Backup Priority' }),
        i18nKey: 'backup.priority',
        key: 'backupPriority',
        width: 140,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('backupPriority', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('backupPriority', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'local.backup.count', defaultMessage: 'Local Backups' }),
        i18nKey: 'local.backup.count',
        key: 'localBackupCount',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('localBackupCount', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('localBackupCount', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'local.backup.capacity', defaultMessage: 'Local Backup Size' }),
        i18nKey: 'local.backup.capacity',
        key: 'localBackupCapacity',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('localBackupCapacity', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('localBackupCapacity', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'shareType', defaultMessage: 'Sharing Mode' }),
        i18nKey: 'shareType',
        key: 'shareType',
        width: 140,filters: [],
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('shareType', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('shareType', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'zone', defaultMessage: 'Data Center' }),
        i18nKey: 'zone',
        key: 'zone',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('zone', options)?.linkResource || ''
            const val = formatValue('zone', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('zone', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('zone', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap items-center gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'owner', defaultMessage: 'Owner' }),
        i18nKey: 'owner',
        key: 'owner',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('owner', options)?.linkResource || ''
            const val = formatValue('owner', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('owner', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('owner', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap items-center gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'user.group', defaultMessage: 'User Group' }),
        i18nKey: 'user.group',
        key: 'user.group',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('user.group', options)?.linkResource || ''
            const val = formatValue('user.group', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('user.group', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('user.group', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap items-center gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'lastOpDate', defaultMessage: 'Last Operation Time' }),
        i18nKey: 'lastOpDate',
        key: 'lastOpDate',
        width: 200,sorter: true,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('lastOpDate', value, options)
            return val || val === 0 ? <Text>{getServerTime(val).format('YYYY-MM-DD HH:mm:ss')}</Text> : null
          }
          const renderExtra = getOption('lastOpDate', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'createDate', defaultMessage: 'Creation Time' }),
        i18nKey: 'createDate',
        key: 'createDate',
        width: 200,sorter: true,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('createDate', value, options)
            return val || val === 0 ? <Text>{getServerTime(val).format('YYYY-MM-DD HH:mm:ss')}</Text> : null
          }
          const renderExtra = getOption('createDate', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
      {
        title: intl.formatMessage({ id: 'vm.guesttool', defaultMessage: 'VMTools' }),
        i18nKey: 'vm.guesttool',
        key: 'vmGuesttool',
        width: 200,filters: [],
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('vmGuesttool', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('vmGuesttool', options)?.extra
          if (renderExtra) {
            return (
              <div className="flex flex-nowrap gap-2">
                <div className="min-w-0 flex-auto">
                  {renderText(value)}
                </div>
                <div className="flex-none">
                  {renderExtra(value)}
                </div>
              </div>
            )
          } else {
            return renderText(value)
          }
        },
      },
    ],
    viewMap: {
      'main': ['name', 'console', 'state', 'cdpTaskStatus', 'cpuNum', 'memorySize', 'defaultIpv4', 'defaultIpv6', 'architecture', 'platform', 'ha', 'qemuState', 'tag', 'group', 'owner', 'createDate'],
      'select': ['name', 'state', 'cpuNum', 'memorySize', 'defaultIpv4', 'defaultIpv6', 'hostIp', 'cluster', 'architecture', 'platform', 'ha', 'group', 'owner', 'createDate'],
      'select.virtualization': ['name', 'state', 'cpuNum', 'memorySize', 'host', 'cluster', 'owner', 'createDate'],
      'sub.alarm': ['name', 'state', 'cpuNum', 'memorySize', 'defaultIpv4', 'defaultIpv6', 'owner', 'createDate'],
      'sub.alarm.cdp-task': ['name', 'state', 'defaultIpv4', 'defaultIpv6', 'group', 'owner', 'createDate'],
      'sub.kms': ['name', 'state', 'defaultIpv4', 'tag', 'group', 'createDate'],
      'sub.virtualization': ['name', 'console', 'state', 'cpuNum', 'memorySize', 'totalVolumeSize', 'cpuAverageUsedUtilization', 'memoryUsedInPercent', 'vm.storage.usage', 'defaultIpv4', 'defaultIpv6', 'architecture', 'ha', 'createDate'],
      'sub.virtualization.account': ['name', 'state', 'defaultIpv4', 'group', 'owner'],
      'sub.virtualization.backup-storage.detail.exported': ['name', 'format', 'cpuNum', 'memorySize', 'totalVolumeSize', 'defaultIpv4', 'guestOsType', 'tag', 'ovfSize', 'owner', 'createDate'],
      'sub.virtualization.backup.policy': ['name', 'state', 'lastBackupJobResult', 'backupJobState', 'backupPriority', 'localBackupCount', 'localBackupCapacity', 'createDate'],
      'sub.virtualization.directory': ['name', 'console', 'state', 'cpuNum', 'memorySize', 'totalVolumeSize', 'cpuAverageUsedUtilization', 'memoryUsedInPercent', 'vm.storage.usage', 'host', 'architecture', 'guestOsType', 'group', 'owner', 'createDate'],
      'sub.virtualization.fiber-channel-lun': ['name', 'state', 'cpuNum', 'memorySize', 'defaultIpv4', 'hostIp', 'cluster', 'ha', 'owner', 'createDate'],
      'sub.virtualization.host': ['name', 'console', 'state', 'cpuNum', 'memorySize', 'totalVolumeSize', 'cpuAverageUsedUtilization', 'memoryUsedInPercent', 'vm.storage.usage', 'defaultIpv4', 'architecture', 'ha', 'lastHost', 'shareType', 'createDate'],
      'sub.virtualization.image': ['name', 'state', 'defaultIpv4', 'defaultIpv6', 'cluster', 'ha', 'group', 'owner', 'createDate'],
      'sub.virtualization.iscsi.lun': ['name', 'state', 'cpuNum', 'memorySize', 'totalVolumeSize', 'defaultIpv4', 'hostIp', 'cluster', 'ha', 'owner', 'createDate'],
      'sub.virtualization.primary.storage': ['name', 'state', 'cpuNum', 'memorySize', 'totalVolumeSize', 'cpuAverageUsedUtilization', 'memoryUsedInPercent', 'vm.storage.usage', 'defaultIpv4', 'defaultIpv6', 'ha', 'owner', 'createDate'],
      'sub.virtualization.snapshot-strategy': ['name', 'console', 'state', 'cpuNum', 'memorySize', 'totalVolumeSize', 'defaultIpv4', 'architecture', 'ha', 'createDate'],
      'sub.virtualization.tag': ['name', 'console', 'state', 'cpuNum', 'memorySize', 'ha', 'createDate'],
      'sub.virtualization.user': ['name', 'shareType', 'owner', 'createDate'],
      'sub.virtualization.userGroup': ['name', 'shareType', 'owner', 'user.group', 'createDate'],
      'sub.virtualization.userGroup.shared': ['name', 'shareType', 'owner', 'createDate'],
      'sub.virtualization.vm-group': ['name', 'state', 'totalVolumeSize', 'defaultIpv4', 'host', 'lastHost', 'createDate'],
      'sub.virtualization.vm-scheduling-rule': ['name', 'state', 'schedulingState', 'totalVolumeSize', 'defaultIpv4', 'host', 'lastHost', 'createDate'],
      'sub.virtualization.vm.export': ['name', 'format', 'ovfSize', 'vm', 'export.backupStorage', 'zone', 'owner', 'createDate'],
      'sub.virtualization.vm.template': ['name'],
      'sub.virtualization.zone': ['name', 'console', 'state', 'cpuNum', 'memorySize', 'totalVolumeSize', 'cpuAverageUsedUtilization', 'memoryUsedInPercent', 'vm.storage.usage', 'host', 'architecture', 'guestOsType', 'group', 'shareType', 'owner', 'createDate'],
      'sub.virtualization.zone.recyle': ['name', 'state', 'retention.Period', 'cpuNum', 'memorySize', 'defaultIpv4', 'architecture', 'guestOsType', 'tag', 'zone', 'owner', 'lastOpDate'],
      'sub.zsv.vm.template': ['name', 'console', 'state', 'cpuNum', 'memorySize', 'totalVolumeSize', 'defaultIpv4', 'architecture'],
      'virtualization.custom': ['name', 'console', 'state', 'cpuNum', 'memorySize', 'totalVolumeSize', 'cpuAverageUsedUtilization', 'memoryUsedInPercent', 'vm.storage.usage', 'defaultIpv4', 'defaultIpv6', 'defaultMac', 'hostIp', 'host', 'cluster', 'architecture', 'guestOsType', 'ha', 'primaryStorage', 'tag', 'lastHost', 'group', 'shareType', 'owner', 'createDate', 'vmGuesttool'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
