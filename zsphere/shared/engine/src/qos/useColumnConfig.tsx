
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'

import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'port' | 'vip.qos.outbound.bandwidth' | 'vip.qos.inbound.bandwidth' | '__action__'

export type IOption<T extends Item> = Array<Omit<IColumnType<T>, 'key'> & { key: IKey }>

function useColumnConfig<T extends Item>(
  options:IOption<T> = []
): ITableListProps<T>['columnConfig'] {
  const intl = useIntl()

  const { getServerTime } = useTime()

  const _columnConfig: ITableListProps<T>['columnConfig'] = useMemo(() => ({
    list: [
      {
        title: intl.formatMessage({ id: 'port', defaultMessage: 'Port' }),
        i18nKey: 'port',
        key: 'port',
        width: 200,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('port', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('port', options)?.extra
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
        title: intl.formatMessage({ id: 'networkOutboundBandwidth', defaultMessage: 'Upstream Bandwidth' }),
        i18nKey: 'networkOutboundBandwidth',
        key: 'vip.qos.outbound.bandwidth',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('vip.qos.outbound.bandwidth', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('vip.qos.outbound.bandwidth', options)?.extra
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
        title: intl.formatMessage({ id: 'networkInboundBandwidth', defaultMessage: 'Downstream Bandwidth' }),
        i18nKey: 'networkInboundBandwidth',
        key: 'vip.qos.inbound.bandwidth',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('vip.qos.inbound.bandwidth', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('vip.qos.inbound.bandwidth', options)?.extra
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
      'main': ['port', 'vip.qos.outbound.bandwidth', 'vip.qos.inbound.bandwidth'],
      'select': [],
      'sub': [],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
