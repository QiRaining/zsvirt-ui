
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'
import { Constant } from '@zstack/design'
import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'name' | 'uuid' | 'web.terminal' | 'state' | 'status' | 'ipmiPowerStatus' | 'virtualCapacityUtilization' | 'physicalCapacityUtilization' | 'managementIp' | '__tagUuid__' | 'architecture' | 'cluster' | 'hypervisorType' | 'cpuNum' | 'memorySize' | 'average.cpu.usage' | 'memory.usage' | 'qemuState' | 'runtime' | 'ipmiAddress' | 'createDate' | 'host.for.bond' | 'bondingName' | 'bond.compose' | 'bond.mode' | 'virtualization.hashPolicy' | '__action__'

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
        title: intl.formatMessage({ id: 'uuid', defaultMessage: 'UUID' }),
        i18nKey: 'uuid',
        key: 'uuid',
        width: 100,
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
        title: intl.formatMessage({ id: 'web.terminal', defaultMessage: 'Web Terminal' }),
        i18nKey: 'web.terminal',
        key: 'web.terminal',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('web.terminal', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('web.terminal', options)?.extra
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
        title: intl.formatMessage({ id: 'enable.state', defaultMessage: 'State' }),
        i18nKey: 'enable.state',
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
        title: intl.formatMessage({ id: 'ready.state', defaultMessage: 'Status' }),
        i18nKey: 'ready.state',
        key: 'status',
        width: 140,filters: [],
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
        title: intl.formatMessage({ id: 'power.status', defaultMessage: 'Power Status' }),
        i18nKey: 'power.status',
        key: 'ipmiPowerStatus',
        width: 140,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('ipmiPowerStatus', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('ipmiPowerStatus', options)?.extra
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
        title: intl.formatMessage({ id: 'virtual.capacity.utilization', defaultMessage: 'Virtual Capacity Utilization' }),
        i18nKey: 'virtual.capacity.utilization',
        key: 'virtualCapacityUtilization',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('virtualCapacityUtilization', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('virtualCapacityUtilization', options)?.extra
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
        title: intl.formatMessage({ id: 'physical.capacity.utilization', defaultMessage: 'Physical Storage Utilization' }),
        i18nKey: 'physical.capacity.utilization',
        key: 'physicalCapacityUtilization',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('physicalCapacityUtilization', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('physicalCapacityUtilization', options)?.extra
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
        title: intl.formatMessage({ id: 'host.ip', defaultMessage: 'Host IP' }),
        i18nKey: 'host.ip',
        key: 'managementIp',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('managementIp', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('managementIp', options)?.extra
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
        title: intl.formatMessage({ id: 'tag', defaultMessage: 'Tag' }),
        i18nKey: 'tag',
        key: '__tagUuid__',
        width: 200,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('__tagUuid__', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('__tagUuid__', options)?.extra
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
        title: intl.formatMessage({ id: 'cluster', defaultMessage: 'Cluster' }),
        i18nKey: 'cluster',
        key: 'cluster',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('cluster', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('cluster', options)?.extra
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
        title: intl.formatMessage({ id: 'hypervisor.type', defaultMessage: 'Hypervisor' }),
        i18nKey: 'hypervisor.type',
        key: 'hypervisorType',
        width: 140,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('hypervisorType', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
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
        title: intl.formatMessage({ id: 'cpu', defaultMessage: 'CPU' }),
        i18nKey: 'cpu',
        key: 'cpuNum',
        width: 140,
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
        title: intl.formatMessage({ id: 'memorySize', defaultMessage: 'Memory' }),
        i18nKey: 'memorySize',
        key: 'memorySize',
        width: 140,
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
        title: intl.formatMessage({ id: 'cpu.allocation.rate', defaultMessage: 'CPU Utilization' }),
        i18nKey: 'cpu.allocation.rate',
        key: 'average.cpu.usage',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('average.cpu.usage', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('average.cpu.usage', options)?.extra
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
        title: intl.formatMessage({ id: 'memory.allocation.rate', defaultMessage: 'Memory Utilization' }),
        i18nKey: 'memory.allocation.rate',
        key: 'memory.usage',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('memory.usage', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('memory.usage', options)?.extra
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
        width: 140,
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
        title: intl.formatMessage({ id: 'runtime', defaultMessage: 'Uptime' }),
        i18nKey: 'runtime',
        key: 'runtime',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('runtime', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('runtime', options)?.extra
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
        title: intl.formatMessage({ id: 'host.ipmi.address', defaultMessage: 'IPMI Address' }),
        i18nKey: 'host.ipmi.address',
        key: 'ipmiAddress',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ipmiAddress', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ipmiAddress', options)?.extra
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
        title: intl.formatMessage({ id: 'create.date', defaultMessage: 'Creation Time' }),
        i18nKey: 'create.date',
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
        title: intl.formatMessage({ id: 'virtualization.host', defaultMessage: 'Host' }),
        i18nKey: 'virtualization.host',
        key: 'host.for.bond',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('host.for.bond', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('host.for.bond', options)?.extra
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
        title: intl.formatMessage({ id: 'bonding.name', defaultMessage: 'Bond Name' }),
        i18nKey: 'bonding.name',
        key: 'bondingName',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('bondingName', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('bondingName', options)?.extra
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
        title: intl.formatMessage({ id: 'bond.compose', defaultMessage: 'Bond Components' }),
        i18nKey: 'bond.compose',
        key: 'bond.compose',
        width: 280,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('bond.compose', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('bond.compose', options)?.extra
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
        title: intl.formatMessage({ id: 'bond.mode', defaultMessage: 'Bond Mode' }),
        i18nKey: 'bond.mode',
        key: 'bond.mode',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('bond.mode', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('bond.mode', options)?.extra
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
        title: intl.formatMessage({ id: 'virtualization.HashPolicy', defaultMessage: 'Hash Policy' }),
        i18nKey: 'virtualization.HashPolicy',
        key: 'virtualization.hashPolicy',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('virtualization.hashPolicy', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('virtualization.hashPolicy', options)?.extra
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
      'main': ['name', 'web.terminal', 'state', 'status', 'managementIp', 'cluster', 'average.cpu.usage', 'memory.usage', 'createDate'],
      'main.custom': ['name', 'uuid', 'web.terminal', 'state', 'status', 'ipmiPowerStatus', 'managementIp', '__tagUuid__', 'architecture', 'cluster', 'hypervisorType', 'average.cpu.usage', 'memory.usage', 'createDate'],
      'select': ['name', 'state', 'status', 'managementIp', '__tagUuid__', 'cluster', 'createDate'],
      'select.v2v.conversion.host': ['name', 'managementIp', 'cluster', 'hypervisorType'],
      'select.virtualization.hostKernelInterface': ['name', 'state', 'status', 'managementIp', 'cluster', 'createDate'],
      'select.vm.migration': ['name', 'state', 'status', 'managementIp', 'cluster', 'hypervisorType', 'average.cpu.usage', 'memory.usage'],
      'sub.alarm': ['name', 'state', 'status', 'hypervisorType', 'createDate'],
      'sub.host-group': ['name', 'state', 'status', 'managementIp', 'hypervisorType', 'createDate'],
      'sub.virtualization.cluster': ['name', 'web.terminal', 'state', 'status', 'managementIp', 'average.cpu.usage', 'memory.usage', 'createDate'],
      'sub.virtualization.fiber-channel-lun': ['name', 'state', 'status', 'managementIp', 'hypervisorType', 'createDate'],
      'sub.virtualization.host-group': ['name', 'state', 'status', 'managementIp', 'hypervisorType', 'createDate'],
      'sub.virtualization.iscsi.lun': ['name', 'state', 'status', 'managementIp', 'hypervisorType', 'createDate'],
      'sub.virtualization.not.in.vswitch': ['host.for.bond', 'bondingName', 'bond.compose', 'bond.mode', 'virtualization.hashPolicy'],
      'sub.virtualization.nvmelun': ['name', 'state', 'status', 'managementIp', 'hypervisorType', 'createDate'],
      'sub.virtualization.primary.storage': ['name', 'state', 'status', 'createDate'],
      'sub.virtualization.tag': ['name', 'state', 'status', 'managementIp', 'hypervisorType', 'createDate'],
      'sub.virtualization.zone': ['name', 'web.terminal', 'state', 'status', 'managementIp', 'cluster', 'average.cpu.usage', 'memory.usage', 'createDate'],
      'virtualization.custom': ['name', 'web.terminal', 'state', 'status', 'ipmiPowerStatus', 'managementIp', '__tagUuid__', 'architecture', 'cluster', 'hypervisorType', 'cpuNum', 'memorySize', 'average.cpu.usage', 'memory.usage', 'runtime', 'ipmiAddress', 'createDate'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
