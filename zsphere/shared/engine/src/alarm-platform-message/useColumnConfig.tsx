
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'
import { Constant } from '@zstack/design'
import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'dataUuid' | 'resourceUuid' | 'alarmMessage' | 'resourceName' | 'triggerAction' | 'emergencyLevel' | 'confirmState' | 'alarmType' | 'alarmTimes' | 'time' | 'confirmer' | 'ackPeriod' | 'ackDate' | '__action__'

export type IOption<T extends Item> = Array<Omit<IColumnType<T>, 'key'> & { key: IKey }>

function useColumnConfig<T extends Item>(
  options:IOption<T> = []
): ITableListProps<T>['columnConfig'] {
  const intl = useIntl()

  const { getServerTime } = useTime()

  const _columnConfig: ITableListProps<T>['columnConfig'] = useMemo(() => ({
    list: [
      {
        title: intl.formatMessage({ id: 'messageUuid', defaultMessage: 'Message UUID' }),
        i18nKey: 'messageUuid',
        key: 'dataUuid',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('dataUuid', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('dataUuid', options)?.extra
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
        title: intl.formatMessage({ id: 'resourceUuid', defaultMessage: 'Resource UUID' }),
        i18nKey: 'resourceUuid',
        key: 'resourceUuid',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('resourceUuid', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('resourceUuid', options)?.extra
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
        title: intl.formatMessage({ id: 'messageContent', defaultMessage: 'Alarm Name' }),
        i18nKey: 'messageContent',
        key: 'alarmMessage',
        width: 280,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('alarmMessage', options)?.linkResource || ''
            const val = formatValue('alarmMessage', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('alarmMessage', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('alarmMessage', options)?.extra
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
        title: intl.formatMessage({ id: 'alarm.message.resource', defaultMessage: 'Resource' }),
        i18nKey: 'alarm.message.resource',
        key: 'resourceName',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('resourceName', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('resourceName', options)?.extra
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
        title: intl.formatMessage({ id: 'triggerAction', defaultMessage: 'Trigger Action' }),
        i18nKey: 'triggerAction',
        key: 'triggerAction',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('triggerAction', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('triggerAction', options)?.extra
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
        title: intl.formatMessage({ id: 'emergencyLevel', defaultMessage: 'Severity' }),
        i18nKey: 'emergencyLevel',
        key: 'emergencyLevel',
        width: 140,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('emergencyLevel', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('emergencyLevel', options)?.extra
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
        title: intl.formatMessage({ id: 'alarm.message.confirm.state', defaultMessage: 'Acknowledged' }),
        i18nKey: 'alarm.message.confirm.state',
        key: 'confirmState',
        width: 140,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('confirmState', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('confirmState', options)?.extra
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
        title: intl.formatMessage({ id: 'messageType', defaultMessage: 'Message Type' }),
        i18nKey: 'messageType',
        key: 'alarmType',
        width: 140,filters: [],
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('alarmType', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('alarmType', options)?.extra
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
        title: intl.formatMessage({ id: 'alarmTimes', defaultMessage: 'Alarm Times' }),
        i18nKey: 'alarmTimes',
        key: 'alarmTimes',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('alarmTimes', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('alarmTimes', options)?.extra
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
        title: intl.formatMessage({ id: 'lastAlarmTime', defaultMessage: 'Last Alarm Time' }),
        i18nKey: 'lastAlarmTime',
        key: 'time',
        width: 200,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('time', value, options)
            return val || val === 0 ? <Text>{getServerTime(val).format('YYYY-MM-DD HH:mm:ss')}</Text> : null
          }
          const renderExtra = getOption('time', options)?.extra
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
        title: intl.formatMessage({ id: 'confirmer', defaultMessage: 'Acknowledged by' }),
        i18nKey: 'confirmer',
        key: 'confirmer',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('confirmer', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('confirmer', options)?.extra
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
        title: intl.formatMessage({ id: 'silencePeriod', defaultMessage: 'Muted for' }),
        i18nKey: 'silencePeriod',
        key: 'ackPeriod',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ackPeriod', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ackPeriod', options)?.extra
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
        title: intl.formatMessage({ id: 'ack.start.time', defaultMessage: 'Muted Since' }),
        i18nKey: 'ack.start.time',
        key: 'ackDate',
        width: 200,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('ackDate', value, options)
            return val || val === 0 ? <Text>{getServerTime(val).format('YYYY-MM-DD HH:mm:ss')}</Text> : null
          }
          const renderExtra = getOption('ackDate', options)?.extra
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
      'main': ['alarmMessage', 'resourceName', 'emergencyLevel', 'confirmState', 'alarmType', 'alarmTimes', 'time', 'confirmer', 'ackPeriod', 'ackDate'],
      'main.unread': ['alarmMessage', 'resourceName', 'emergencyLevel', 'confirmState', 'alarmType', 'alarmTimes', 'time', 'confirmer', 'ackPeriod', 'ackDate'],
      'select': ['alarmMessage', 'resourceName', 'emergencyLevel', 'alarmType', 'alarmTimes', 'time', 'confirmer', 'ackPeriod', 'ackDate'],
      'sub': ['alarmMessage', 'resourceName', 'emergencyLevel', 'alarmType', 'alarmTimes', 'time', 'confirmer', 'ackPeriod', 'ackDate'],
      'sub.global.alert': ['alarmMessage', 'resourceName', 'emergencyLevel', 'alarmTimes', 'time'],
      'sub.monitor.group': ['alarmMessage', 'resourceName', 'emergencyLevel', 'alarmType', 'alarmTimes', 'time', 'confirmer', 'ackPeriod', 'ackDate'],
      'sub.virtualization': ['alarmMessage', 'resourceName', 'emergencyLevel', 'confirmState', 'alarmType', 'alarmTimes', 'time', 'confirmer', 'ackPeriod', 'ackDate'],
      'virtualization.global.list': ['alarmMessage', 'resourceName', 'emergencyLevel', 'confirmState', 'alarmTimes', 'time', 'confirmer'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
