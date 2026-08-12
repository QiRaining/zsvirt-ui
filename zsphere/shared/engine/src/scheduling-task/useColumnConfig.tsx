
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'
import { Constant } from '@zstack/design'
import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'actionDescrition' | 'migration.status' | 'job.object' | 'cluster.which.belongs' | 'pre.host' | 'target.host' | 'trigger.reason' | 'startTime' | 'end.time' | 'uuid' | '__action__'

export type IOption<T extends Item> = Array<Omit<IColumnType<T>, 'key'> & { key: IKey }>

function useColumnConfig<T extends Item>(
  options:IOption<T> = []
): ITableListProps<T>['columnConfig'] {
  const intl = useIntl()

  const { getServerTime } = useTime()

  const _columnConfig: ITableListProps<T>['columnConfig'] = useMemo(() => ({
    list: [
      {
        title: intl.formatMessage({ id: 'actionDescrition', defaultMessage: 'Action Description' }),
        i18nKey: 'actionDescrition',
        key: 'actionDescrition',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('actionDescrition', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('actionDescrition', options)?.extra
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
        title: intl.formatMessage({ id: 'migration.status', defaultMessage: 'Migration Status' }),
        i18nKey: 'migration.status',
        key: 'migration.status',
        width: 100,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('migration.status', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('migration.status', options)?.extra
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
        title: intl.formatMessage({ id: 'migration.object', defaultMessage: 'Migration Object' }),
        i18nKey: 'migration.object',
        key: 'job.object',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('job.object', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('job.object', options)?.extra
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
        title: intl.formatMessage({ id: 'cluster.which.belongs', defaultMessage: 'Cluster' }),
        i18nKey: 'cluster.which.belongs',
        key: 'cluster.which.belongs',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('cluster.which.belongs', options)?.linkResource || ''
            const val = formatValue('cluster.which.belongs', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('cluster.which.belongs', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('cluster.which.belongs', options)?.extra
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
        title: intl.formatMessage({ id: 'pre.host', defaultMessage: 'Pre Host' }),
        i18nKey: 'pre.host',
        key: 'pre.host',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('pre.host', options)?.linkResource || ''
            const val = formatValue('pre.host', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('pre.host', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('pre.host', options)?.extra
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
        title: intl.formatMessage({ id: 'target.host', defaultMessage: 'Destination Host' }),
        i18nKey: 'target.host',
        key: 'target.host',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('target.host', options)?.linkResource || ''
            const val = formatValue('target.host', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('target.host', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('target.host', options)?.extra
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
        title: intl.formatMessage({ id: 'trigger.reason', defaultMessage: 'Trigger Reason' }),
        i18nKey: 'trigger.reason',
        key: 'trigger.reason',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('trigger.reason', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('trigger.reason', options)?.extra
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
        title: intl.formatMessage({ id: 'startTime', defaultMessage: 'Start Time' }),
        i18nKey: 'startTime',
        key: 'startTime',
        width: 200,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('startTime', value, options)
            return val || val === 0 ? <Text>{getServerTime(val).format('YYYY-MM-DD HH:mm:ss')}</Text> : null
          }
          const renderExtra = getOption('startTime', options)?.extra
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
        title: intl.formatMessage({ id: 'end.time', defaultMessage: 'End Time' }),
        i18nKey: 'end.time',
        key: 'end.time',
        width: 200,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('end.time', value, options)
            return val || val === 0 ? <Text>{getServerTime(val).format('YYYY-MM-DD HH:mm:ss')}</Text> : null
          }
          const renderExtra = getOption('end.time', options)?.extra
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
        title: intl.formatMessage({ id: 'virtualization.UUID', defaultMessage: 'UUID' }),
        i18nKey: 'virtualization.UUID',
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
    ],
    viewMap: {
      'main': ['actionDescrition', 'migration.status', 'job.object', 'cluster.which.belongs', 'pre.host', 'target.host', 'trigger.reason', 'startTime', 'end.time'],
      'sub.cluster': ['actionDescrition', 'migration.status', 'job.object', 'pre.host', 'target.host', 'trigger.reason', 'startTime', 'end.time'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
