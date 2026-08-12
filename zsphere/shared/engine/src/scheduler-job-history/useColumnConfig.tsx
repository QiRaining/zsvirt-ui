
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'
import { Constant } from '@zstack/design'
import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'startExecutionTime' | 'job.result' | 'backup.method' | 'resource.num' | 'backupCapacity' | 'execute.time' | 'endTime' | 'scheduler.job.history.name' | 'schedulerName' | 'backup.data' | 'resource.name' | 'backup.resource.name' | 'jobType' | 'operationName' | 'startTime' | 'process.status' | 'resource.count' | 'duration' | 'execution.endTime' | '__action__'

export type IOption<T extends Item> = Array<Omit<IColumnType<T>, 'key'> & { key: IKey }>

function useColumnConfig<T extends Item>(
  options:IOption<T> = []
): ITableListProps<T>['columnConfig'] {
  const intl = useIntl()

  const { getServerTime } = useTime()

  const _columnConfig: ITableListProps<T>['columnConfig'] = useMemo(() => ({
    list: [
      {
        title: intl.formatMessage({ id: 'execute.time', defaultMessage: 'Execution Time' }),
        i18nKey: 'execute.time',
        key: 'startExecutionTime',
        width: 200,sorter: true,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('startExecutionTime', value, options)
            return val || val === 0 ? <Text>{getServerTime(val).format('YYYY-MM-DD HH:mm:ss')}</Text> : null
          }
          const renderExtra = getOption('startExecutionTime', options)?.extra
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
        title: intl.formatMessage({ id: 'backup.task.result', defaultMessage: 'Backup Job Result' }),
        i18nKey: 'backup.task.result',
        key: 'job.result',
        width: 140,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('job.result', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('job.result', options)?.extra
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
        title: intl.formatMessage({ id: 'backup.method', defaultMessage: 'Backup Mode' }),
        i18nKey: 'backup.method',
        key: 'backup.method',
        width: 140,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('backup.method', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('backup.method', options)?.extra
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
        title: intl.formatMessage({ id: 'backup.resource', defaultMessage: 'Backup Resources' }),
        i18nKey: 'backup.resource',
        key: 'resource.num',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('resource.num', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('resource.num', options)?.extra
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
        title: intl.formatMessage({ id: 'backup.total.capacity', defaultMessage: 'Total Backup Size' }),
        i18nKey: 'backup.total.capacity',
        key: 'backupCapacity',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('backupCapacity', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('backupCapacity', options)?.extra
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
        title: intl.formatMessage({ id: 'backup.consumed.time', defaultMessage: 'Time Consumed' }),
        i18nKey: 'backup.consumed.time',
        key: 'execute.time',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('execute.time', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('execute.time', options)?.extra
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
        title: intl.formatMessage({ id: 'backup.finish.time', defaultMessage: 'Completion Time' }),
        i18nKey: 'backup.finish.time',
        key: 'endTime',
        width: 200,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('endTime', value, options)
            return val || val === 0 ? <Text>{getServerTime(val).format('YYYY-MM-DD HH:mm:ss')}</Text> : null
          }
          const renderExtra = getOption('endTime', options)?.extra
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
        title: intl.formatMessage({ id: 'name', defaultMessage: 'Name' }),
        i18nKey: 'name',
        key: 'scheduler.job.history.name',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('scheduler.job.history.name', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('scheduler.job.history.name', options)?.extra
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
        title: intl.formatMessage({ id: 'name', defaultMessage: 'Name' }),
        i18nKey: 'name',
        key: 'schedulerName',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('schedulerName', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('schedulerName', options)?.extra
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
        title: intl.formatMessage({ id: 'backupData', defaultMessage: 'Backup Data' }),
        i18nKey: 'backupData',
        key: 'backup.data',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('backup.data', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('backup.data', options)?.extra
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
        title: intl.formatMessage({ id: 'resourceName', defaultMessage: 'Name' }),
        i18nKey: 'resourceName',
        key: 'resource.name',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('resource.name', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('resource.name', options)?.extra
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
        title: intl.formatMessage({ id: 'backupResourceName', defaultMessage: 'Backup Resource Name' }),
        i18nKey: 'backupResourceName',
        key: 'backup.resource.name',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('backup.resource.name', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('backup.resource.name', options)?.extra
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
        title: intl.formatMessage({ id: 'backup.object', defaultMessage: 'Backup Object' }),
        i18nKey: 'backup.object',
        key: 'jobType',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('jobType', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('jobType', options)?.extra
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
        title: intl.formatMessage({ id: 'operation.name', defaultMessage: 'Task Description' }),
        i18nKey: 'operation.name',
        key: 'operationName',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('operationName', options)?.linkResource || ''
            const val = formatValue('operationName', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('operationName', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('operationName', options)?.extra
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
        title: intl.formatMessage({ id: 'execution.startTime', defaultMessage: 'Start Time' }),
        i18nKey: 'execution.startTime',
        key: 'startTime',
        width: 200,sorter: true,
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
        title: intl.formatMessage({ id: 'process.status', defaultMessage: 'Result' }),
        i18nKey: 'process.status',
        key: 'process.status',
        width: 140,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('process.status', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('process.status', options)?.extra
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
        title: intl.formatMessage({ id: 'resource.count', defaultMessage: 'Resources' }),
        i18nKey: 'resource.count',
        key: 'resource.count',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('resource.count', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('resource.count', options)?.extra
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
        title: intl.formatMessage({ id: 'timeConsumingTask', defaultMessage: 'Time Consumed' }),
        i18nKey: 'timeConsumingTask',
        key: 'duration',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('duration', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('duration', options)?.extra
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
        title: intl.formatMessage({ id: 'execution.endTime', defaultMessage: 'Completion Time' }),
        i18nKey: 'execution.endTime',
        key: 'execution.endTime',
        width: 200,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('execution.endTime', value, options)
            return val || val === 0 ? <Text>{getServerTime(val).format('YYYY-MM-DD HH:mm:ss')}</Text> : null
          }
          const renderExtra = getOption('execution.endTime', options)?.extra
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
      'main': ['startExecutionTime', 'job.result', 'backup.method', 'resource.num', 'execute.time', 'endTime'],
      'select': [],
      'sub': ['startExecutionTime', 'job.result', 'backup.method', 'resource.num', 'execute.time', 'endTime'],
      'sub.database': ['startExecutionTime', 'job.result', 'backup.method', 'resource.num', 'execute.time', 'endTime'],
      'sub.overview': ['startExecutionTime', 'job.result', 'backup.method', 'resource.num', 'backupCapacity', 'schedulerName', 'jobType', 'duration'],
      'sub.overview.detail': ['job.result', 'backup.method', 'backupCapacity', 'execute.time', 'endTime', 'backup.data', 'resource.name', 'startTime'],
      'sub.scheduler.job.group': ['startExecutionTime', 'job.result', 'backup.method', 'resource.num', 'backupCapacity', 'execute.time', 'endTime'],
      'sub.scheduler.job.history.detail': ['job.result', 'execute.time', 'endTime', 'backup.resource.name', 'startTime'],
      'sub.virtualization.snapshot-strategy': ['operationName', 'startTime', 'process.status', 'resource.count', 'duration', 'execution.endTime'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
