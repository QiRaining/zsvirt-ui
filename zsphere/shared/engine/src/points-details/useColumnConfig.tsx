
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'

import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'associated.resource.name' | 'type' | 'activation.time' | 'expire.time' | '__action__'

export type IOption<T extends Item> = Array<Omit<IColumnType<T>, 'key'> & { key: IKey }>

function useColumnConfig<T extends Item>(
  options:IOption<T> = []
): ITableListProps<T>['columnConfig'] {
  const intl = useIntl()

  const { getServerTime } = useTime()

  const _columnConfig: ITableListProps<T>['columnConfig'] = useMemo(() => ({
    list: [
      {
        title: intl.formatMessage({ id: 'associated.resource.name', defaultMessage: 'Associated Resource Name' }),
        i18nKey: 'associated.resource.name',
        key: 'associated.resource.name',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('associated.resource.name', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('associated.resource.name', options)?.extra
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
        title: intl.formatMessage({ id: 'type', defaultMessage: 'Type' }),
        i18nKey: 'type',
        key: 'type',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('type', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('type', options)?.extra
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
        title: intl.formatMessage({ id: 'activation.time', defaultMessage: 'Activation Time' }),
        i18nKey: 'activation.time',
        key: 'activation.time',
        width: 200,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('activation.time', value, options)
            return val || val === 0 ? <Text>{getServerTime(val).format('YYYY-MM-DD HH:mm:ss')}</Text> : null
          }
          const renderExtra = getOption('activation.time', options)?.extra
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
        title: intl.formatMessage({ id: 'expire.time', defaultMessage: 'Expires on' }),
        i18nKey: 'expire.time',
        key: 'expire.time',
        width: 200,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('expire.time', value, options)
            return val || val === 0 ? <Text>{getServerTime(val).format('YYYY-MM-DD HH:mm:ss')}</Text> : null
          }
          const renderExtra = getOption('expire.time', options)?.extra
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
      'main': ['associated.resource.name', 'type', 'activation.time', 'expire.time'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
