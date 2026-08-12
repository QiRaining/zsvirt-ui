
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'
import { Constant } from '@zstack/design'
import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'name' | 'uuid' | 'architecture' | 'baremetal2ChassisNum' | 'baremetal2GatewayNum' | 'state' | 'createDate' | '__action__'

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
        width: 140,
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
        title: intl.formatMessage({ id: 'elasticBaremetalNodeCount', defaultMessage: 'Baremetal Nodes' }),
        i18nKey: 'elasticBaremetalNodeCount',
        key: 'baremetal2ChassisNum',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('baremetal2ChassisNum', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('baremetal2ChassisNum', options)?.extra
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
        title: intl.formatMessage({ id: 'gatewayNodeCount', defaultMessage: 'Gateway Nodes' }),
        i18nKey: 'gatewayNodeCount',
        key: 'baremetal2GatewayNum',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('baremetal2GatewayNum', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('baremetal2GatewayNum', options)?.extra
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
      'main': ['name', 'architecture', 'baremetal2ChassisNum', 'baremetal2GatewayNum', 'state', 'createDate'],
      'select': ['name', 'architecture', 'baremetal2ChassisNum', 'baremetal2GatewayNum', 'createDate'],
      'select.baremetal2.gateway': ['name', 'architecture', 'baremetal2ChassisNum', 'baremetal2GatewayNum', 'createDate'],
      'select.gateway.create': ['name', 'architecture', 'baremetal2ChassisNum', 'baremetal2GatewayNum', 'createDate'],
      'select.iscsi.server': ['name', 'architecture', 'baremetal2ChassisNum', 'baremetal2GatewayNum', 'createDate'],
      'select.l2.network.attach': ['name', 'architecture', 'baremetal2ChassisNum', 'baremetal2GatewayNum', 'createDate'],
      'select.primary.storage': ['name', 'architecture', 'baremetal2ChassisNum', 'baremetal2GatewayNum', 'createDate'],
      'select.pxe.server.create': ['name', 'architecture', 'baremetal2ChassisNum', 'baremetal2GatewayNum', 'createDate'],
      'select.virtualization.iscsi.server': ['name', 'architecture', 'baremetal2ChassisNum', 'baremetal2GatewayNum', 'createDate'],
      'sub': ['name', 'architecture', 'state', 'createDate'],
      'sub.iscsi.server': ['name', 'architecture', 'state', 'createDate'],
      'sub.l2.network': ['name', 'architecture', 'state', 'createDate'],
      'sub.primary.storage': ['name', 'architecture', 'state', 'createDate'],
      'sub.provision.network': ['name', 'architecture', 'state', 'createDate'],
      'sub.virtualization.iscsi.server': ['name', 'architecture', 'baremetal2ChassisNum', 'baremetal2GatewayNum', 'createDate'],
      'sub.zone': ['name', 'architecture', 'state', 'createDate'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
