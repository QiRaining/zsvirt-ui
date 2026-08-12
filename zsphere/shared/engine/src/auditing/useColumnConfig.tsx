
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'

import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'apiName' | 'operatorAccountNameForLogin' | 'resourceUuid' | 'resourceName' | 'resourceType' | 'duration' | 'clientIp' | 'clientBrowser' | 'isError' | 'operatorAccountName' | 'clientIpForResource' | 'createTime' | 'time' | '__action__'

export type IOption<T extends Item> = Array<Omit<IColumnType<T>, 'key'> & { key: IKey }>

function useColumnConfig<T extends Item>(
  options:IOption<T> = []
): ITableListProps<T>['columnConfig'] {
  const intl = useIntl()

  const { getServerTime } = useTime()

  const _columnConfig: ITableListProps<T>['columnConfig'] = useMemo(() => ({
    list: [
      {
        title: intl.formatMessage({ id: 'apiName', defaultMessage: 'API Name' }),
        i18nKey: 'apiName',
        key: 'apiName',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('apiName', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('apiName', options)?.extra
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
        title: intl.formatMessage({ id: 'operator', defaultMessage: 'Operator' }),
        i18nKey: 'operator',
        key: 'operatorAccountNameForLogin',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('operatorAccountNameForLogin', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('operatorAccountNameForLogin', options)?.extra
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
        title: intl.formatMessage({ id: 'resourceName', defaultMessage: 'Name' }),
        i18nKey: 'resourceName',
        key: 'resourceName',
        width: 200,
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
        title: intl.formatMessage({ id: 'resourceType', defaultMessage: 'Resource Type' }),
        i18nKey: 'resourceType',
        key: 'resourceType',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('resourceType', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('resourceType', options)?.extra
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
        title: intl.formatMessage({ id: 'consumingTime', defaultMessage: 'Time Consumed' }),
        i18nKey: 'consumingTime',
        key: 'duration',
        width: 100,
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
        title: intl.formatMessage({ id: 'loginIP', defaultMessage: 'Login IP' }),
        i18nKey: 'loginIP',
        key: 'clientIp',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('clientIp', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('clientIp', options)?.extra
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
        title: intl.formatMessage({ id: 'browser', defaultMessage: 'Browser' }),
        i18nKey: 'browser',
        key: 'clientBrowser',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('clientBrowser', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('clientBrowser', options)?.extra
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
        title: intl.formatMessage({ id: 'taskResult', defaultMessage: 'Task Result' }),
        i18nKey: 'taskResult',
        key: 'isError',
        width: 100,filters: [],
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('isError', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('isError', options)?.extra
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
        title: intl.formatMessage({ id: 'operator', defaultMessage: 'Operator' }),
        i18nKey: 'operator',
        key: 'operatorAccountName',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('operatorAccountName', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('operatorAccountName', options)?.extra
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
        title: intl.formatMessage({ id: 'operator.ip', defaultMessage: 'Operator IP' }),
        i18nKey: 'operator.ip',
        key: 'clientIpForResource',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('clientIpForResource', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('clientIpForResource', options)?.extra
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
        key: 'createTime',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('createTime', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('createTime', options)?.extra
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
        title: intl.formatMessage({ id: 'overTime', defaultMessage: 'Completion Time' }),
        i18nKey: 'overTime',
        key: 'time',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('time', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
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
    ],
    viewMap: {
      'main.login': ['apiName', 'operatorAccountNameForLogin', 'duration', 'clientIp', 'clientBrowser', 'isError', 'createTime', 'time'],
      'main.resource': ['apiName', 'resourceType', 'duration', 'isError', 'operatorAccountName', 'createTime', 'time'],
      'select': [],
      'sub': ['apiName', 'resourceType', 'duration', 'isError', 'operatorAccountName', 'createTime', 'time'],
      'sub.longjob': ['apiName', 'resourceType', 'duration', 'isError', 'operatorAccountName', 'createTime', 'time'],
      'virtualization.main.login': ['apiName', 'operatorAccountNameForLogin', 'duration', 'clientIp', 'clientBrowser', 'isError', 'createTime', 'time'],
      'virtualization.main.resource': ['apiName', 'resourceName', 'resourceType', 'duration', 'isError', 'operatorAccountName', 'clientIpForResource', 'createTime', 'time'],
      'virtualization.sub': ['apiName', 'resourceName', 'resourceType', 'duration', 'isError', 'operatorAccountName', 'clientIpForResource', 'createTime', 'time'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
