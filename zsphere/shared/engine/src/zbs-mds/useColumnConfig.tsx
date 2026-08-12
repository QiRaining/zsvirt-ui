
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'
import { Constant } from '@zstack/design'
import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'mdsAddr' | 'mdsNodeIp' | 'connection.status' | 'ssh.port' | 'ssh.user.name' | 'create.date' | '__action__'

export type IOption<T extends Item> = Array<Omit<IColumnType<T>, 'key'> & { key: IKey }>

function useColumnConfig<T extends Item>(
  options:IOption<T> = []
): ITableListProps<T>['columnConfig'] {
  const intl = useIntl()

  const { getServerTime } = useTime()

  const _columnConfig: ITableListProps<T>['columnConfig'] = useMemo(() => ({
    list: [
      {
        title: intl.formatMessage({ id: 'virtualization.mds.ip', defaultMessage: 'MDS IP' }),
        i18nKey: 'virtualization.mds.ip',
        key: 'mdsAddr',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('mdsAddr', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('mdsAddr', options)?.extra
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
        title: intl.formatMessage({ id: 'virtualization.mds.node.manage.ip', defaultMessage: 'MDS Node Management IP' }),
        i18nKey: 'virtualization.mds.node.manage.ip',
        key: 'mdsNodeIp',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('mdsNodeIp', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('mdsNodeIp', options)?.extra
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
        title: intl.formatMessage({ id: 'virtualization.connectStatus', defaultMessage: 'Connection Status' }),
        i18nKey: 'virtualization.connectStatus',
        key: 'connection.status',
        width: 100,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('connection.status', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('connection.status', options)?.extra
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
        title: intl.formatMessage({ id: 'sshPort', defaultMessage: 'SSH Port' }),
        i18nKey: 'sshPort',
        key: 'ssh.port',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ssh.port', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ssh.port', options)?.extra
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
        title: intl.formatMessage({ id: 'virtualization.ssh.user.name', defaultMessage: 'SSH Username' }),
        i18nKey: 'virtualization.ssh.user.name',
        key: 'ssh.user.name',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ssh.user.name', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ssh.user.name', options)?.extra
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
        title: intl.formatMessage({ id: 'virtualization.create.date', defaultMessage: 'Creation Time' }),
        i18nKey: 'virtualization.create.date',
        key: 'create.date',
        width: 200,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('create.date', value, options)
            return val || val === 0 ? <Text>{getServerTime(val).format('YYYY-MM-DD HH:mm:ss')}</Text> : null
          }
          const renderExtra = getOption('create.date', options)?.extra
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
      'virtualization.main': ['mdsAddr', 'mdsNodeIp', 'connection.status', 'ssh.port', 'ssh.user.name', 'create.date'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
