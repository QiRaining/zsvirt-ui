
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'
import { Constant } from '@zstack/design'
import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'name' | 'uuid' | 'networkType' | 'vpcVRouter' | 'avaliableCapacity' | 'cidr' | 'vpc.network' | 'ipv4Cidr' | 'ipv6Cidr' | 'ip.allocation.strategy' | 'dhcp.service' | 'toPublic' | 'createDate' | '__action__'

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
        title: intl.formatMessage({ id: 'networkType', defaultMessage: 'Network Type' }),
        i18nKey: 'networkType',
        key: 'networkType',
        width: 100,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('networkType', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('networkType', options)?.extra
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
        title: intl.formatMessage({ id: 'vpc.vrouter', defaultMessage: 'VPC vRouter' }),
        i18nKey: 'vpc.vrouter',
        key: 'vpcVRouter',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('vpcVRouter', options)?.linkResource || ''
            const val = formatValue('vpcVRouter', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('vpcVRouter', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('vpcVRouter', options)?.extra
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
        title: intl.formatMessage({ id: 'ipv4.address.usage', defaultMessage: 'IPv4 Address Utilization' }),
        i18nKey: 'ipv4.address.usage',
        key: 'avaliableCapacity',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('avaliableCapacity', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('avaliableCapacity', options)?.extra
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
        title: intl.formatMessage({ id: 'cidr', defaultMessage: 'CIDR' }),
        i18nKey: 'cidr',
        key: 'cidr',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('cidr', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('cidr', options)?.extra
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
        title: intl.formatMessage({ id: 'vpc.network', defaultMessage: 'VPC Network' }),
        i18nKey: 'vpc.network',
        key: 'vpc.network',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('vpc.network', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('vpc.network', options)?.extra
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
        title: intl.formatMessage({ id: 'ipv5Cidr', defaultMessage: 'IPv4 CIDR' }),
        i18nKey: 'ipv5Cidr',
        key: 'ipv4Cidr',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ipv4Cidr', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ipv4Cidr', options)?.extra
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
        title: intl.formatMessage({ id: 'ipv7Cidr', defaultMessage: 'IPv6 CIDR' }),
        i18nKey: 'ipv7Cidr',
        key: 'ipv6Cidr',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ipv6Cidr', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ipv6Cidr', options)?.extra
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
        title: intl.formatMessage({ id: 'ip.allocation.strategy', defaultMessage: 'IP Allocation Policy' }),
        i18nKey: 'ip.allocation.strategy',
        key: 'ip.allocation.strategy',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ip.allocation.strategy', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ip.allocation.strategy', options)?.extra
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
        title: intl.formatMessage({ id: 'dhcp.service', defaultMessage: 'DHCP Service' }),
        i18nKey: 'dhcp.service',
        key: 'dhcp.service',
        width: 100,filters: [],
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('dhcp.service', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('dhcp.service', options)?.extra
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
        key: 'toPublic',
        width: 140,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('toPublic', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('toPublic', options)?.extra
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
      'main.vpc': ['name', 'vpcVRouter', 'avaliableCapacity', 'ipv4Cidr', 'ipv6Cidr', 'toPublic', 'createDate'],
      'main.vpc.share': ['name', 'vpcVRouter', 'avaliableCapacity', 'ipv4Cidr', 'ipv6Cidr', 'toPublic', 'createDate'],
      'select.vpc': ['name', 'vpcVRouter', 'avaliableCapacity', 'ipv4Cidr', 'ipv6Cidr', 'ip.allocation.strategy', 'dhcp.service', 'createDate'],
      'sub.ipsec.connection': ['cidr', 'vpc.network', 'createDate'],
      'sub.l2-network': ['name', 'networkType', 'avaliableCapacity', 'ipv4Cidr', 'ipv6Cidr', 'toPublic', 'createDate'],
      'sub.security-group': ['name', 'networkType', 'avaliableCapacity', 'ipv4Cidr', 'ipv6Cidr', 'toPublic', 'createDate'],
      'sub.shared.resource': ['name', 'toPublic'],
      'sub.vpc': ['name', 'vpcVRouter', 'avaliableCapacity', 'ipv4Cidr', 'ipv6Cidr', 'toPublic', 'createDate'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
