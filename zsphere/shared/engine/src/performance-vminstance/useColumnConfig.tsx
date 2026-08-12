
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'
import { Constant } from '@zstack/design'
import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'name' | 'state' | 'plugInState' | 'defaultIp' | 'actuallySize' | 'totalVolumeSize' | 'platform' | 'OperatingSystemCPUAverageUsedUtilization' | 'OperatingSystemCPUAverageSystemUtilization' | 'OperatingSystemCPUAverageUserUtilization' | 'OperatingSystemCPUAverageWaitUtilization' | 'OperatingSystemCPUAverageIdleUtilization' | 'OperatingSystemMemoryUsedPercent' | 'OperatingSystemMemoryFreePercent' | 'DiskAllUsedCapacityInPercent' | 'DiskAllFreeCapacityInPercent' | 'VRouterCPUUsedUtilization' | 'VRouterCPUAverageSystemUtilization' | 'VRouterCPUAverageUserUtilization' | 'VRouterCPUAverageWaitUtilization' | 'VRouterCPUAverageIdleUtilization' | 'VRouterMemoryUsedPercent' | 'VRouterMemoryFreePercent' | 'VRouterDiskUsedCapacityInPercent' | 'VRouterDiskAllFreeCapacityInPercent' | 'CPUAverageUsedUtilization' | 'MemoryUsedInPercent' | 'DiskAllReadBytes' | 'DiskAllWriteBytes' | 'DiskAllReadOps' | 'DiskAllWriteOps' | 'NetworkAllInBytes' | 'NetworkAllOutBytes' | 'NetworkAllInPackets' | 'NetworkAllOutPackets' | 'NetworkAllInErrors' | 'NetworkAllOutErrors' | 'owner' | '__action__'

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
        title: intl.formatMessage({ id: 'enableState', defaultMessage: 'State' }),
        i18nKey: 'enableState',
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
        title: intl.formatMessage({ id: 'plugin.status', defaultMessage: 'Plugin Status' }),
        i18nKey: 'plugin.status',
        key: 'plugInState',
        width: 140,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('plugInState', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('plugInState', options)?.extra
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
        key: 'defaultIp',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('defaultIp', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('defaultIp', options)?.extra
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
        title: intl.formatMessage({ id: 'totalVolumeSize', defaultMessage: 'Total Disk Capacity' }),
        i18nKey: 'totalVolumeSize',
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
        title: intl.formatMessage({ id: 'platform', defaultMessage: 'Platform' }),
        i18nKey: 'platform',
        key: 'platform',
        width: 100,filters: [],
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
        title: intl.formatMessage({ id: 'cpu.usage', defaultMessage: 'CPU Utilization' }),
        i18nKey: 'cpu.usage',
        key: 'OperatingSystemCPUAverageUsedUtilization',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('OperatingSystemCPUAverageUsedUtilization', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('OperatingSystemCPUAverageUsedUtilization', options)?.extra
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
        title: intl.formatMessage({ id: 'cpu.system.usage', defaultMessage: 'CPU Occupancy Rate (System Process)' }),
        i18nKey: 'cpu.system.usage',
        key: 'OperatingSystemCPUAverageSystemUtilization',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('OperatingSystemCPUAverageSystemUtilization', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('OperatingSystemCPUAverageSystemUtilization', options)?.extra
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
        title: intl.formatMessage({ id: 'cpu.user.usage', defaultMessage: 'CPU Occupancy Rate (User Process)' }),
        i18nKey: 'cpu.user.usage',
        key: 'OperatingSystemCPUAverageUserUtilization',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('OperatingSystemCPUAverageUserUtilization', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('OperatingSystemCPUAverageUserUtilization', options)?.extra
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
        title: intl.formatMessage({ id: 'cpu.wait.usage', defaultMessage: 'CPU Occupancy Rate (Waiting)' }),
        i18nKey: 'cpu.wait.usage',
        key: 'OperatingSystemCPUAverageWaitUtilization',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('OperatingSystemCPUAverageWaitUtilization', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('OperatingSystemCPUAverageWaitUtilization', options)?.extra
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
        title: intl.formatMessage({ id: 'cpu.free.usage', defaultMessage: 'CPU Idle Rate' }),
        i18nKey: 'cpu.free.usage',
        key: 'OperatingSystemCPUAverageIdleUtilization',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('OperatingSystemCPUAverageIdleUtilization', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('OperatingSystemCPUAverageIdleUtilization', options)?.extra
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
        key: 'OperatingSystemMemoryUsedPercent',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('OperatingSystemMemoryUsedPercent', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('OperatingSystemMemoryUsedPercent', options)?.extra
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
        title: intl.formatMessage({ id: 'memory.free.usage', defaultMessage: 'Memory Idle Rate' }),
        i18nKey: 'memory.free.usage',
        key: 'OperatingSystemMemoryFreePercent',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('OperatingSystemMemoryFreePercent', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('OperatingSystemMemoryFreePercent', options)?.extra
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
        title: intl.formatMessage({ id: 'disk.usage', defaultMessage: 'Disk Utilization' }),
        i18nKey: 'disk.usage',
        key: 'DiskAllUsedCapacityInPercent',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('DiskAllUsedCapacityInPercent', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('DiskAllUsedCapacityInPercent', options)?.extra
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
        title: intl.formatMessage({ id: 'disk.free.usage', defaultMessage: 'Disk Idle Rate' }),
        i18nKey: 'disk.free.usage',
        key: 'DiskAllFreeCapacityInPercent',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('DiskAllFreeCapacityInPercent', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('DiskAllFreeCapacityInPercent', options)?.extra
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
        key: 'VRouterCPUUsedUtilization',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('VRouterCPUUsedUtilization', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('VRouterCPUUsedUtilization', options)?.extra
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
        title: intl.formatMessage({ id: 'cpu.system.usage', defaultMessage: 'CPU Occupancy Rate (System Process)' }),
        i18nKey: 'cpu.system.usage',
        key: 'VRouterCPUAverageSystemUtilization',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('VRouterCPUAverageSystemUtilization', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('VRouterCPUAverageSystemUtilization', options)?.extra
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
        title: intl.formatMessage({ id: 'cpu.user.usage', defaultMessage: 'CPU Occupancy Rate (User Process)' }),
        i18nKey: 'cpu.user.usage',
        key: 'VRouterCPUAverageUserUtilization',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('VRouterCPUAverageUserUtilization', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('VRouterCPUAverageUserUtilization', options)?.extra
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
        title: intl.formatMessage({ id: 'cpu.wait.usage', defaultMessage: 'CPU Occupancy Rate (Waiting)' }),
        i18nKey: 'cpu.wait.usage',
        key: 'VRouterCPUAverageWaitUtilization',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('VRouterCPUAverageWaitUtilization', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('VRouterCPUAverageWaitUtilization', options)?.extra
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
        title: intl.formatMessage({ id: 'cpu.free.usage', defaultMessage: 'CPU Idle Rate' }),
        i18nKey: 'cpu.free.usage',
        key: 'VRouterCPUAverageIdleUtilization',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('VRouterCPUAverageIdleUtilization', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('VRouterCPUAverageIdleUtilization', options)?.extra
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
        key: 'VRouterMemoryUsedPercent',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('VRouterMemoryUsedPercent', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('VRouterMemoryUsedPercent', options)?.extra
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
        title: intl.formatMessage({ id: 'memory.free.usage', defaultMessage: 'Memory Idle Rate' }),
        i18nKey: 'memory.free.usage',
        key: 'VRouterMemoryFreePercent',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('VRouterMemoryFreePercent', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('VRouterMemoryFreePercent', options)?.extra
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
        title: intl.formatMessage({ id: 'disk.usage', defaultMessage: 'Disk Utilization' }),
        i18nKey: 'disk.usage',
        key: 'VRouterDiskUsedCapacityInPercent',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('VRouterDiskUsedCapacityInPercent', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('VRouterDiskUsedCapacityInPercent', options)?.extra
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
        title: intl.formatMessage({ id: 'disk.free.usage', defaultMessage: 'Disk Idle Rate' }),
        i18nKey: 'disk.free.usage',
        key: 'VRouterDiskAllFreeCapacityInPercent',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('VRouterDiskAllFreeCapacityInPercent', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('VRouterDiskAllFreeCapacityInPercent', options)?.extra
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
        key: 'CPUAverageUsedUtilization',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('CPUAverageUsedUtilization', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('CPUAverageUsedUtilization', options)?.extra
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
        key: 'MemoryUsedInPercent',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('MemoryUsedInPercent', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('MemoryUsedInPercent', options)?.extra
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
        title: intl.formatMessage({ id: 'disk.read.rate', defaultMessage: 'Disk Read Rate' }),
        i18nKey: 'disk.read.rate',
        key: 'DiskAllReadBytes',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('DiskAllReadBytes', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('DiskAllReadBytes', options)?.extra
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
        title: intl.formatMessage({ id: 'disk.write.rate', defaultMessage: 'Disk Write Rate' }),
        i18nKey: 'disk.write.rate',
        key: 'DiskAllWriteBytes',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('DiskAllWriteBytes', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('DiskAllWriteBytes', options)?.extra
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
        title: intl.formatMessage({ id: 'disk.read.iops', defaultMessage: 'Disk Read IOPS' }),
        i18nKey: 'disk.read.iops',
        key: 'DiskAllReadOps',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('DiskAllReadOps', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('DiskAllReadOps', options)?.extra
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
        title: intl.formatMessage({ id: 'disk.write.iops', defaultMessage: 'Disk Write IOPS' }),
        i18nKey: 'disk.write.iops',
        key: 'DiskAllWriteOps',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('DiskAllWriteOps', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('DiskAllWriteOps', options)?.extra
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
        title: intl.formatMessage({ id: 'nic.in.rate', defaultMessage: 'NIC in Rate' }),
        i18nKey: 'nic.in.rate',
        key: 'NetworkAllInBytes',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('NetworkAllInBytes', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('NetworkAllInBytes', options)?.extra
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
        title: intl.formatMessage({ id: 'nic.out.rate', defaultMessage: 'NIC Out Rate' }),
        i18nKey: 'nic.out.rate',
        key: 'NetworkAllOutBytes',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('NetworkAllOutBytes', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('NetworkAllOutBytes', options)?.extra
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
        title: intl.formatMessage({ id: 'network.card.in.packets.count', defaultMessage: 'NIC In Packets' }),
        i18nKey: 'network.card.in.packets.count',
        key: 'NetworkAllInPackets',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('NetworkAllInPackets', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('NetworkAllInPackets', options)?.extra
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
        title: intl.formatMessage({ id: 'network.card.out.packet.count', defaultMessage: 'NIC Out Packets' }),
        i18nKey: 'network.card.out.packet.count',
        key: 'NetworkAllOutPackets',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('NetworkAllOutPackets', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('NetworkAllOutPackets', options)?.extra
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
        title: intl.formatMessage({ id: 'network.card.incoming.error.rate', defaultMessage: 'NIC In Errors Rate' }),
        i18nKey: 'network.card.incoming.error.rate',
        key: 'NetworkAllInErrors',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('NetworkAllInErrors', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('NetworkAllInErrors', options)?.extra
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
        title: intl.formatMessage({ id: 'network.card.error.rate', defaultMessage: 'NIC Out Errors Rate' }),
        i18nKey: 'network.card.error.rate',
        key: 'NetworkAllOutErrors',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('NetworkAllOutErrors', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('NetworkAllOutErrors', options)?.extra
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
        title: intl.formatMessage({ id: 'owner', defaultMessage: 'Owner' }),
        i18nKey: 'owner',
        key: 'owner',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('owner', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('owner', options)?.extra
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
      'main': [],
      'main.custom': [],
      'vm.main': ['name', 'state', 'defaultIp', 'actuallySize', 'totalVolumeSize', 'CPUAverageUsedUtilization', 'MemoryUsedInPercent', 'DiskAllReadBytes', 'DiskAllWriteOps', 'NetworkAllInBytes', 'NetworkAllInPackets', 'NetworkAllInErrors', 'owner'],
      'vm.main.custom': ['name', 'state', 'defaultIp', 'actuallySize', 'totalVolumeSize', 'CPUAverageUsedUtilization', 'MemoryUsedInPercent', 'DiskAllReadBytes', 'DiskAllWriteBytes', 'DiskAllReadOps', 'DiskAllWriteOps', 'NetworkAllInBytes', 'NetworkAllOutBytes', 'NetworkAllInPackets', 'NetworkAllOutPackets', 'NetworkAllInErrors', 'NetworkAllOutErrors', 'owner'],
      'vmInner.main': ['name', 'state', 'plugInState', 'defaultIp', 'actuallySize', 'totalVolumeSize', 'OperatingSystemCPUAverageUsedUtilization', 'OperatingSystemMemoryUsedPercent', 'DiskAllUsedCapacityInPercent', 'owner'],
      'vmInner.main.custom': ['name', 'state', 'plugInState', 'defaultIp', 'actuallySize', 'totalVolumeSize', 'platform', 'OperatingSystemCPUAverageUsedUtilization', 'OperatingSystemCPUAverageSystemUtilization', 'OperatingSystemCPUAverageUserUtilization', 'OperatingSystemCPUAverageWaitUtilization', 'OperatingSystemCPUAverageIdleUtilization', 'OperatingSystemMemoryUsedPercent', 'OperatingSystemMemoryFreePercent', 'DiskAllUsedCapacityInPercent', 'DiskAllFreeCapacityInPercent', 'owner'],
      'vpcRouter.main': ['name', 'CPUAverageUsedUtilization', 'MemoryUsedInPercent', 'DiskAllReadBytes', 'DiskAllWriteOps', 'NetworkAllInBytes', 'NetworkAllInPackets', 'NetworkAllInErrors', 'owner'],
      'vpcRouter.main.custom': ['name', 'CPUAverageUsedUtilization', 'MemoryUsedInPercent', 'DiskAllReadBytes', 'DiskAllWriteBytes', 'DiskAllReadOps', 'DiskAllWriteOps', 'NetworkAllInBytes', 'NetworkAllOutBytes', 'NetworkAllInPackets', 'NetworkAllOutPackets', 'NetworkAllInErrors', 'NetworkAllOutErrors', 'owner'],
      'vpcRouterInner.main': ['name', 'VRouterCPUUsedUtilization', 'VRouterMemoryUsedPercent', 'VRouterDiskUsedCapacityInPercent', 'owner'],
      'vpcRouterInner.main.custom': ['name', 'defaultIp', 'VRouterCPUUsedUtilization', 'VRouterCPUAverageSystemUtilization', 'VRouterCPUAverageUserUtilization', 'VRouterCPUAverageWaitUtilization', 'VRouterCPUAverageIdleUtilization', 'VRouterMemoryUsedPercent', 'VRouterMemoryFreePercent', 'VRouterDiskUsedCapacityInPercent', 'VRouterDiskAllFreeCapacityInPercent', 'owner'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
