
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'

import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'name' | 'uuid' | 'managementNode.ip' | 'version' | 'size' | 'backstorage' | 'backupStorageName' | 'backup.url' | 'isRemoteSynced' | 'isLocalSynced' | 'createDate' | '__action__'

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
        width: 200,
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
        title: intl.formatMessage({ id: 'managementNode.ip', defaultMessage: 'MN IP' }),
        i18nKey: 'managementNode.ip',
        key: 'managementNode.ip',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('managementNode.ip', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('managementNode.ip', options)?.extra
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
        title: intl.formatMessage({ id: 'version', defaultMessage: 'Version' }),
        i18nKey: 'version',
        key: 'version',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('version', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('version', options)?.extra
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
        title: intl.formatMessage({ id: 'size', defaultMessage: 'Capacity' }),
        i18nKey: 'size',
        key: 'size',
        width: 140,sorter: true,
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
        title: intl.formatMessage({ id: 'backstorage', defaultMessage: 'Backup Storage' }),
        i18nKey: 'backstorage',
        key: 'backstorage',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('backstorage', options)?.linkResource || ''
            const val = formatValue('backstorage', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('backstorage', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('backstorage', options)?.extra
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
        title: intl.formatMessage({ id: 'local.backup.server', defaultMessage: 'Local Backup Storage' }),
        i18nKey: 'local.backup.server',
        key: 'backupStorageName',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('backupStorageName', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('backupStorageName', options)?.extra
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
        title: intl.formatMessage({ id: 'backup.url', defaultMessage: 'Backup Storage Path' }),
        i18nKey: 'backup.url',
        key: 'backup.url',
        width: 280,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('backup.url', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('backup.url', options)?.extra
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
        title: intl.formatMessage({ id: 'sync.to.remote', defaultMessage: 'Sync to Remote' }),
        i18nKey: 'sync.to.remote',
        key: 'isRemoteSynced',
        width: 140,filters: [],
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('isRemoteSynced', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('isRemoteSynced', options)?.extra
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
        title: intl.formatMessage({ id: 'sync.to.local', defaultMessage: 'Sync to Local' }),
        i18nKey: 'sync.to.local',
        key: 'isLocalSynced',
        width: 140,filters: [],
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('isLocalSynced', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('isLocalSynced', options)?.extra
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
        title: intl.formatMessage({ id: 'create.date', defaultMessage: 'Creation Time' }),
        i18nKey: 'create.date',
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
      'main': ['name', 'version', 'size', 'backupStorageName', 'isRemoteSynced', 'createDate'],
      'main.local': ['name', 'version', 'size', 'backstorage', 'isRemoteSynced', 'createDate'],
      'main.managementNode': ['name', 'managementNode.ip', 'version', 'size', 'backup.url', 'createDate'],
      'main.remote': ['name', 'version', 'size', 'backstorage', 'isLocalSynced', 'createDate'],
      'sub.local': ['name', 'version', 'size', 'isRemoteSynced', 'createDate'],
      'sub.remote': ['name', 'version', 'size', 'isLocalSynced', 'createDate'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
