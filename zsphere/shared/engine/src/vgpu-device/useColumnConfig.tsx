
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'
import { Constant } from '@zstack/design'
import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'name' | 'vendorId' | 'specInfo' | 'address' | 'host' | 'parent' | 'state' | 'status' | 'vmInstance' | 'shareType' | 'createDate' | '__action__'

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
            const val = formatValue('name', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('name', options)?.extra
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
        title: intl.formatMessage({ id: 'vendorId', defaultMessage: 'Vendor' }),
        i18nKey: 'vendorId',
        key: 'vendorId',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('vendorId', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('vendorId', options)?.extra
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
        title: intl.formatMessage({ id: 'specInfo', defaultMessage: 'Specification' }),
        i18nKey: 'specInfo',
        key: 'specInfo',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('specInfo', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('specInfo', options)?.extra
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
        title: intl.formatMessage({ id: 'deviceAddress', defaultMessage: 'Device Address' }),
        i18nKey: 'deviceAddress',
        key: 'address',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('address', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('address', options)?.extra
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
        title: intl.formatMessage({ id: 'host', defaultMessage: 'Host' }),
        i18nKey: 'host',
        key: 'host',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('host', options)?.linkResource || ''
            const val = formatValue('host', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('host', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('host', options)?.extra
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
        title: intl.formatMessage({ id: 'physicsGpu', defaultMessage: 'Physical GPU' }),
        i18nKey: 'physicsGpu',
        key: 'parent',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('parent', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('parent', options)?.extra
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
        title: intl.formatMessage({ id: 'enabledState', defaultMessage: 'State' }),
        i18nKey: 'enabledState',
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
        title: intl.formatMessage({ id: 'readyStatus', defaultMessage: 'Status' }),
        i18nKey: 'readyStatus',
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
        title: intl.formatMessage({ id: 'associated.object', defaultMessage: 'Associated Objects' }),
        i18nKey: 'associated.object',
        key: 'vmInstance',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('vmInstance', options)?.linkResource || ''
            const val = formatValue('vmInstance', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('vmInstance', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('vmInstance', options)?.extra
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
        title: intl.formatMessage({ id: 'shareType', defaultMessage: 'Sharing Mode' }),
        i18nKey: 'shareType',
        key: 'shareType',
        width: 100,filters: [],
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
      'main': ['name', 'specInfo', 'parent', 'state', 'status', 'createDate'],
      'select': ['name', 'specInfo', 'parent', 'state', 'status', 'createDate'],
      'sub': ['name', 'specInfo', 'parent', 'state', 'status', 'createDate'],
      'sub.cluster': ['name', 'specInfo', 'address', 'host', 'parent', 'state', 'status', 'vmInstance', 'createDate'],
      'sub.host': ['name', 'specInfo', 'address', 'parent', 'state', 'status', 'vmInstance', 'shareType', 'createDate'],
      'sub.vm': ['name', 'vendorId', 'specInfo', 'address', 'host', 'parent', 'state', 'status', 'createDate'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
