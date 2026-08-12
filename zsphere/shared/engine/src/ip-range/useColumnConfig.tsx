
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'
import { Constant } from '@zstack/design'
import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'startIp' | 'endIp' | 'ipRangeType' | 'prefixLen' | 'netmask' | 'gateway' | 'ipv4Capacity' | 'addressMode' | 'ipv4Cidr' | 'ipv6Cidr' | 'shareType' | '__action__'

export type IOption<T extends Item> = Array<Omit<IColumnType<T>, 'key'> & { key: IKey }>

function useColumnConfig<T extends Item>(
  options:IOption<T> = []
): ITableListProps<T>['columnConfig'] {
  const intl = useIntl()

  const { getServerTime } = useTime()

  const _columnConfig: ITableListProps<T>['columnConfig'] = useMemo(() => ({
    list: [
      {
        title: intl.formatMessage({ id: 'startIp', defaultMessage: 'Start IP' }),
        i18nKey: 'startIp',
        key: 'startIp',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('startIp', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('startIp', options)?.extra
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
        title: intl.formatMessage({ id: 'endIp', defaultMessage: 'End IP' }),
        i18nKey: 'endIp',
        key: 'endIp',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('endIp', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('endIp', options)?.extra
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
        title: intl.formatMessage({ id: 'ipRangeType', defaultMessage: 'Network Range Type' }),
        i18nKey: 'ipRangeType',
        key: 'ipRangeType',
        width: 140,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('ipRangeType', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('ipRangeType', options)?.extra
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
        title: intl.formatMessage({ id: 'prefixLength', defaultMessage: 'Prefix Length' }),
        i18nKey: 'prefixLength',
        key: 'prefixLen',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('prefixLen', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('prefixLen', options)?.extra
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
        title: intl.formatMessage({ id: 'netmask', defaultMessage: 'Netmask' }),
        i18nKey: 'netmask',
        key: 'netmask',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('netmask', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('netmask', options)?.extra
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
        title: intl.formatMessage({ id: 'gateway', defaultMessage: 'Gateway' }),
        i18nKey: 'gateway',
        key: 'gateway',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('gateway', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('gateway', options)?.extra
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
        title: intl.formatMessage({ id: 'ipv4AddressUsage', defaultMessage: 'IPv4 Address Utilization' }),
        i18nKey: 'ipv4AddressUsage',
        key: 'ipv4Capacity',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ipv4Capacity', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ipv4Capacity', options)?.extra
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
        title: intl.formatMessage({ id: 'addressMode', defaultMessage: 'IP Assign Mode' }),
        i18nKey: 'addressMode',
        key: 'addressMode',
        width: 200,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('addressMode', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('addressMode', options)?.extra
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
        title: intl.formatMessage({ id: 'ipv4Cidr', defaultMessage: 'IPv4 CIDR' }),
        i18nKey: 'ipv4Cidr',
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
        title: intl.formatMessage({ id: 'ipv6Cidr', defaultMessage: 'IPv6 CIDR' }),
        i18nKey: 'ipv6Cidr',
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
        title: intl.formatMessage({ id: 'shareType', defaultMessage: 'Sharing Mode' }),
        i18nKey: 'shareType',
        key: 'shareType',
        width: 140,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('shareType', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
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
    ],
    viewMap: {
      'select.eip': ['startIp', 'endIp', 'netmask', 'gateway', 'ipv4Cidr', 'ipv6Cidr'],
      'select.ipsec-connection': ['startIp', 'endIp', 'netmask', 'gateway', 'ipv4Cidr', 'ipv6Cidr'],
      'select.ipv4': ['startIp', 'endIp', 'netmask', 'gateway', 'ipv4Capacity'],
      'select.ipv6': ['startIp', 'endIp', 'netmask', 'gateway'],
      'select.load.balancer': ['startIp', 'endIp', 'ipRangeType', 'netmask', 'gateway', 'ipv4Capacity', 'ipv4Cidr'],
      'select.vip-network': ['startIp', 'endIp', 'ipRangeType', 'netmask', 'gateway', 'ipv4Cidr'],
      'select.vip-network.ipv4': ['startIp', 'endIp', 'ipRangeType', 'netmask', 'gateway', 'ipv4Cidr'],
      'select.vip-network.ipv6': ['startIp', 'endIp', 'prefixLen', 'gateway', 'addressMode', 'ipv6Cidr'],
      'sub.ipv4': ['startIp', 'endIp', 'netmask', 'gateway', 'ipv4Capacity', 'ipv4Cidr'],
      'sub.ipv6': ['startIp', 'endIp', 'prefixLen', 'gateway', 'addressMode', 'ipv6Cidr'],
      'sub.public.ipv4': ['startIp', 'endIp', 'ipRangeType', 'netmask', 'gateway', 'ipv4Capacity', 'ipv4Cidr'],
      'sub.public.ipv6': ['startIp', 'endIp', 'prefixLen', 'gateway', 'addressMode', 'ipv6Cidr'],
      'sub.share.ipv4': ['startIp', 'endIp', 'netmask', 'gateway', 'ipv4Capacity', 'ipv4Cidr'],
      'sub.share.ipv6': ['startIp', 'endIp', 'prefixLen', 'gateway', 'addressMode', 'ipv6Cidr'],
      'sub.share.public.ipv4': ['startIp', 'endIp', 'ipRangeType', 'netmask', 'gateway', 'ipv4Capacity', 'ipv4Cidr'],
      'sub.share.public.ipv6': ['startIp', 'endIp', 'ipRangeType', 'prefixLen', 'gateway', 'addressMode', 'ipv6Cidr'],
      'virtualization.sub.l3network': ['startIp', 'endIp', 'netmask', 'gateway', 'ipv4Capacity', 'ipv4Cidr'],
      'virtualization.sub.l3network.ipv6': ['startIp', 'endIp', 'prefixLen', 'gateway', 'addressMode', 'ipv6Cidr'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
