
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'
import { Constant } from '@zstack/design'
import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'advice.migration.vm' | 'current.host' | 'advice.target.host' | 'reason' | 'executeStatus' | 'adviceCreateTime' | '__action__'

export type IOption<T extends Item> = Array<Omit<IColumnType<T>, 'key'> & { key: IKey }>

function useColumnConfig<T extends Item>(
  options:IOption<T> = []
): ITableListProps<T>['columnConfig'] {
  const intl = useIntl()

  const { getServerTime } = useTime()

  const _columnConfig: ITableListProps<T>['columnConfig'] = useMemo(() => ({
    list: [
      {
        title: intl.formatMessage({ id: 'advice.migration.vm', defaultMessage: 'VM To Be Migrated' }),
        i18nKey: 'advice.migration.vm',
        key: 'advice.migration.vm',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('advice.migration.vm', options)?.linkResource || ''
            const val = formatValue('advice.migration.vm', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('advice.migration.vm', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('advice.migration.vm', options)?.extra
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
        title: intl.formatMessage({ id: 'current.host', defaultMessage: 'Current Host' }),
        i18nKey: 'current.host',
        key: 'current.host',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('current.host', options)?.linkResource || ''
            const val = formatValue('current.host', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('current.host', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('current.host', options)?.extra
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
        title: intl.formatMessage({ id: 'advice.target.host', defaultMessage: 'Recommended Destination Host' }),
        i18nKey: 'advice.target.host',
        key: 'advice.target.host',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('advice.target.host', options)?.linkResource || ''
            const val = formatValue('advice.target.host', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('advice.target.host', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('advice.target.host', options)?.extra
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
        title: intl.formatMessage({ id: 'reason', defaultMessage: 'Reason' }),
        i18nKey: 'reason',
        key: 'reason',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('reason', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('reason', options)?.extra
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
        title: intl.formatMessage({ id: 'executeStatus', defaultMessage: 'Status' }),
        i18nKey: 'executeStatus',
        key: 'executeStatus',
        width: 140,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('executeStatus', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('executeStatus', options)?.extra
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
        title: intl.formatMessage({ id: 'adviceCreateTime', defaultMessage: 'Recommended Creation Time' }),
        i18nKey: 'adviceCreateTime',
        key: 'adviceCreateTime',
        width: 200,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('adviceCreateTime', value, options)
            return val || val === 0 ? <Text>{getServerTime(val).format('YYYY-MM-DD HH:mm:ss')}</Text> : null
          }
          const renderExtra = getOption('adviceCreateTime', options)?.extra
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
      'main': ['advice.migration.vm', 'current.host', 'advice.target.host', 'reason', 'executeStatus', 'adviceCreateTime'],
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
