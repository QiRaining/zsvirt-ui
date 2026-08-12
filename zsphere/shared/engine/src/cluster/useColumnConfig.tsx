
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'
import { Constant } from '@zstack/design'
import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'name' | 'uuid' | 'architecture' | 'vtepCidr' | 'hypervisorType' | 'networkHp' | 'vCenter' | 'hostNum' | 'baremetalChassisNum' | 'cpuUsedRate' | 'memoryUsedRate' | 'primaryStorageUsedRate' | 'state' | 'drsState' | 'haVmHaLevel' | 'cross.cluster.ha' | 'createDate' | '__action__'

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
        title: intl.formatMessage({ id: 'vtepCidr', defaultMessage: 'VTEP CIDR' }),
        i18nKey: 'vtepCidr',
        key: 'vtepCidr',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('vtepCidr', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('vtepCidr', options)?.extra
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
        title: intl.formatMessage({ id: 'hypervisorType', defaultMessage: 'Hypervisor' }),
        i18nKey: 'hypervisorType',
        key: 'hypervisorType',
        width: 140,
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
        title: intl.formatMessage({ id: 'networkHp', defaultMessage: 'Network Acceleration Support' }),
        i18nKey: 'networkHp',
        key: 'networkHp',
        width: 140,filters: [],
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('networkHp', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('networkHp', options)?.extra
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
        title: intl.formatMessage({ id: 'vCenter', defaultMessage: 'vCenter' }),
        i18nKey: 'vCenter',
        key: 'vCenter',
        width: 100,
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
        title: intl.formatMessage({ id: 'hostCount', defaultMessage: 'Hosts' }),
        i18nKey: 'hostCount',
        key: 'hostNum',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('hostNum', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('hostNum', options)?.extra
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
        title: intl.formatMessage({ id: 'baremetalChassis.count', defaultMessage: 'Bare Metal Chassis' }),
        i18nKey: 'baremetalChassis.count',
        key: 'baremetalChassisNum',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('baremetalChassisNum', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('baremetalChassisNum', options)?.extra
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
        title: intl.formatMessage({ id: 'cpuUtilization', defaultMessage: 'CPU Utilization' }),
        i18nKey: 'cpuUtilization',
        key: 'cpuUsedRate',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('cpuUsedRate', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('cpuUsedRate', options)?.extra
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
        title: intl.formatMessage({ id: 'memoryUtilization', defaultMessage: ' Memory Utilization' }),
        i18nKey: 'memoryUtilization',
        key: 'memoryUsedRate',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('memoryUsedRate', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('memoryUsedRate', options)?.extra
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
        title: intl.formatMessage({ id: 'primaryStorage.useage', defaultMessage: 'Data Storage Utilization' }),
        i18nKey: 'primaryStorage.useage',
        key: 'primaryStorageUsedRate',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('primaryStorageUsedRate', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('primaryStorageUsedRate', options)?.extra
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
        title: intl.formatMessage({ id: 'drs.state', defaultMessage: 'DRS State' }),
        i18nKey: 'drs.state',
        key: 'drsState',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('drsState', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('drsState', options)?.extra
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
        title: intl.formatMessage({ id: 'ha.vm.ha.level', defaultMessage: 'VM HA' }),
        i18nKey: 'ha.vm.ha.level',
        key: 'haVmHaLevel',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('haVmHaLevel', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('haVmHaLevel', options)?.extra
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
        title: intl.formatMessage({ id: 'cross.cluster.ha', defaultMessage: 'Cross-Cluster HA' }),
        i18nKey: 'cross.cluster.ha',
        key: 'cross.cluster.ha',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('cross.cluster.ha', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('cross.cluster.ha', options)?.extra
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
    ],
    viewMap: {
      'main': ['name', 'architecture', 'hypervisorType', 'networkHp', 'hostNum', 'cpuUsedRate', 'memoryUsedRate', 'state', 'createDate'],
      'select': [],
      'select.baremetalpxeservice.baremetal': ['name', 'hypervisorType', 'state', 'createDate'],
      'select.iscsi.server': ['name', 'hypervisorType', 'createDate'],
      'select.iscsi.server.attach': ['name', 'hypervisorType', 'hostNum', 'state', 'createDate'],
      'select.l2.network.attach': ['name', 'hypervisorType', 'createDate'],
      'select.primary.storage': ['name', 'hypervisorType', 'hostNum', 'createDate'],
      'select.storage.init.config.cluster': ['name', 'hypervisorType', 'hostNum', 'state', 'createDate'],
      'select.virtualization.iscsi.server': ['name', 'hypervisorType', 'hostNum', 'state', 'createDate'],
      'sub': [],
      'sub.pxe.server': ['name', 'hypervisorType', 'state', 'createDate'],
      'sub.vcenter.network': ['name', 'state', 'createDate'],
      'sub.virtualization.iscsi.server': ['name', 'hypervisorType', 'hostNum', 'state', 'createDate'],
      'sub.virtualization.l2.network': ['name', 'hypervisorType', 'hostNum', 'baremetalChassisNum', 'createDate'],
      'sub.virtualization.l2.network.baremetal': ['name', 'hypervisorType', 'baremetalChassisNum', 'createDate'],
      'sub.virtualization.l2.network.normal': ['name', 'hypervisorType', 'hostNum', 'createDate'],
      'sub.virtualization.nvme': ['name', 'hypervisorType', 'hostNum', 'state', 'createDate'],
      'sub.virtualization.primary.storage': ['name', 'architecture', 'hostNum', 'cpuUsedRate', 'memoryUsedRate', 'primaryStorageUsedRate', 'createDate'],
      'sub.virtualization.zone': ['name', 'architecture', 'hostNum', 'cpuUsedRate', 'memoryUsedRate', 'primaryStorageUsedRate', 'drsState', 'haVmHaLevel', 'cross.cluster.ha', 'createDate'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
