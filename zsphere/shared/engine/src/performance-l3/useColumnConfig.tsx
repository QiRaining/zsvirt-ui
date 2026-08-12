
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'

import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'name' | 'UsedIPCount' | 'AvailableIPCount' | 'UsedIPInPercent' | '__action__'

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
        title: intl.formatMessage({ id: 'number.of.used.ip(IPV4)', defaultMessage: 'Used IPs (IPv4)' }),
        i18nKey: 'number.of.used.ip(IPV4)',
        key: 'UsedIPCount',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('UsedIPCount', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('UsedIPCount', options)?.extra
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
        title: intl.formatMessage({ id: 'available.ip.number(IPV4)', defaultMessage: 'Available IPs (IPv4)' }),
        i18nKey: 'available.ip.number(IPV4)',
        key: 'AvailableIPCount',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('AvailableIPCount', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('AvailableIPCount', options)?.extra
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
        title: intl.formatMessage({ id: 'percentage.of.used.ip(IPV4)', defaultMessage: 'IPv4 Percentage' }),
        i18nKey: 'percentage.of.used.ip(IPV4)',
        key: 'UsedIPInPercent',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('UsedIPInPercent', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('UsedIPInPercent', options)?.extra
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
      'main': ['name', 'UsedIPCount', 'AvailableIPCount', 'UsedIPInPercent'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
