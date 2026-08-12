
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'
import { Constant } from '@zstack/design'
import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'name' | 'uuid' | 'vCenter' | 'mediaType' | 'format' | 'state' | 'status' | 'shareType' | 'size' | 'platform' | 'backupStorage' | 'owner' | 'createDate' | '__action__'

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
        title: intl.formatMessage({ id: 'vcenter', defaultMessage: 'vCenter' }),
        i18nKey: 'vcenter',
        key: 'vCenter',
        width: 200,
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
        title: intl.formatMessage({ id: 'imageType', defaultMessage: 'Image Type' }),
        i18nKey: 'imageType',
        key: 'mediaType',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('mediaType', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('mediaType', options)?.extra
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
        title: intl.formatMessage({ id: 'imageFormat', defaultMessage: 'Image Format' }),
        i18nKey: 'imageFormat',
        key: 'format',
        width: 140,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('format', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('format', options)?.extra
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
        title: intl.formatMessage({ id: 'state', defaultMessage: 'State' }),
        i18nKey: 'state',
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
        title: intl.formatMessage({ id: 'status', defaultMessage: 'Status' }),
        i18nKey: 'status',
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
        title: intl.formatMessage({ id: 'shareMode', defaultMessage: 'Sharing Mode' }),
        i18nKey: 'shareMode',
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
      {
        title: intl.formatMessage({ id: 'capacity', defaultMessage: 'Capacity' }),
        i18nKey: 'capacity',
        key: 'size',
        width: 100,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('size', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('size', options)?.extra
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
        title: intl.formatMessage({ id: 'platform', defaultMessage: 'Platform' }),
        i18nKey: 'platform',
        key: 'platform',
        width: 140,filters: [],
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('platform', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('platform', options)?.extra
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
        title: intl.formatMessage({ id: 'backupStorage', defaultMessage: 'Image Storage' }),
        i18nKey: 'backupStorage',
        key: 'backupStorage',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('backupStorage', options)?.linkResource || ''
            const val = formatValue('backupStorage', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('backupStorage', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('backupStorage', options)?.extra
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
        title: intl.formatMessage({ id: 'owner', defaultMessage: 'Owner' }),
        i18nKey: 'owner',
        key: 'owner',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('owner', options)?.linkResource || ''
            const val = formatValue('owner', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('owner', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('owner', options)?.extra
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
      'main': ['name', 'vCenter', 'mediaType', 'format', 'state', 'status', 'shareType', 'size', 'platform', 'backupStorage', 'owner', 'createDate'],
      'main.mine': ['name', 'mediaType', 'format', 'state', 'status', 'size', 'platform', 'backupStorage', 'owner', 'createDate'],
      'main.shared': ['name', 'mediaType', 'format', 'state', 'status', 'size', 'platform', 'backupStorage', 'owner', 'createDate'],
      'recycle': ['name', 'vCenter', 'mediaType', 'format', 'state', 'shareType', 'size', 'platform', 'backupStorage', 'owner', 'createDate'],
      'select': ['name', 'mediaType', 'size', 'backupStorage', 'createDate'],
      'sub.shared.resource': ['name', 'shareType'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
