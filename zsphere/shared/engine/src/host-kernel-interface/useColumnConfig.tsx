
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'
import { Constant } from '@zstack/design'
import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'name' | 'ipAddress' | 'l3network' | 'l2network' | 'service' | 'createDate' | '__action__'

export type IOption<T extends Item> = Array<Omit<IColumnType<T>, 'key'> & { key: IKey }>

function useColumnConfig<T extends Item>(
  options:IOption<T> = []
): ITableListProps<T>['columnConfig'] {
  const intl = useIntl()

  const { getServerTime } = useTime()

  const _columnConfig: ITableListProps<T>['columnConfig'] = useMemo(() => ({
    list: [
      {
        title: intl.formatMessage({ id: 'virtualization.zskernel.name', defaultMessage: 'Name' }),
        i18nKey: 'virtualization.zskernel.name',
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
        title: intl.formatMessage({ id: 'virtualization.zskernel.ipAddress', defaultMessage: 'IP Address' }),
        i18nKey: 'virtualization.zskernel.ipAddress',
        key: 'ipAddress',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ipAddress', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ipAddress', options)?.extra
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
        title: intl.formatMessage({ id: 'virtualization.zskernel.l3network', defaultMessage: 'Distributed Port Group' }),
        i18nKey: 'virtualization.zskernel.l3network',
        key: 'l3network',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('l3network', options)?.linkResource || ''
            const val = formatValue('l3network', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('l3network', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('l3network', options)?.extra
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
        title: intl.formatMessage({ id: 'virtualization.zskernel.l2network', defaultMessage: 'Distributed Switch' }),
        i18nKey: 'virtualization.zskernel.l2network',
        key: 'l2network',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('l2network', options)?.linkResource || ''
            const val = formatValue('l2network', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('l2network', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('l2network', options)?.extra
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
        title: intl.formatMessage({ id: 'virtualization.zskernel.service', defaultMessage: 'Service' }),
        i18nKey: 'virtualization.zskernel.service',
        key: 'service',
        width: 140,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('service', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('service', options)?.extra
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
        title: intl.formatMessage({ id: 'virtualization.zskernel.createDate', defaultMessage: 'Creation Time' }),
        i18nKey: 'virtualization.zskernel.createDate',
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
      'main': ['name', 'ipAddress', 'l3network', 'l2network', 'service', 'createDate'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
