
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'
import { Constant } from '@zstack/design'
import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'resourceName' | 'licenseName' | 'nicName' | 'l2NicName' | 'originName' | 'backupName' | 'diskName' | 'hostName' | 'mnIP' | 'sourceIPAddress' | 'targetIPAddress' | 'entry' | 'value' | 'cpuName' | 'result' | 'licenseStatus' | 'expireTime' | 'bondName' | 'hostIP' | 'cpuMode' | 'storageIP' | 'baseTimeServer' | 'currentTimeServer' | 'timeSourceConsistency' | 'timeSyncState' | 'IPV4Address' | 'backupServerIP' | 'backupServerMode' | 'type' | 'usageRate' | 'usageMount' | 'availableCapacity' | 'lossRate' | 'netPlugged' | 'nicState' | 'vmCount' | 'enableSwap' | 'enableState' | 'whetherConflict' | 'enableHeartBeatDetection' | 'originMode' | 'readyState' | 'readyStatus' | 'cpuReadyState' | 'monIP' | 'state' | 'capacity' | 'lifeLeft' | 'raidState' | 'vmName' | 'enableBond' | 'enableHa' | 'nodeState' | 'snapshotCount' | 'isConfigured' | 'backupIP' | 'isWeakPassword' | 'nodeConnectState' | 'isValid' | 'connectState' | 'memoryUsage' | 'swapUsage' | 'eccWarning' | 'rpm' | 'hddState' | 'healthstate' | 'ioUtilization' | 'temperature' | 'packageLossRate' | 'netMode' | 'netSpeed' | 'fullDuplexMode' | 'zombieProcessCount' | 'shutDownDays' | 'cacheMode' | '__action__'

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
        key: 'resourceName',
        width: 200,sorter: true,
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
        title: intl.formatMessage({ id: 'name', defaultMessage: 'Name' }),
        i18nKey: 'name',
        key: 'licenseName',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('licenseName', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('licenseName', options)?.extra
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
        key: 'nicName',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('nicName', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('nicName', options)?.extra
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
        key: 'l2NicName',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('l2NicName', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('l2NicName', options)?.extra
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
        key: 'originName',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('originName', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('originName', options)?.extra
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
        key: 'backupName',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('backupName', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('backupName', options)?.extra
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
        title: intl.formatMessage({ id: 'disk.name', defaultMessage: 'Disk Name' }),
        i18nKey: 'disk.name',
        key: 'diskName',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('diskName', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('diskName', options)?.extra
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
        key: 'hostName',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('hostName', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('hostName', options)?.extra
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
        title: intl.formatMessage({ id: 'mn.ip', defaultMessage: 'MN IP' }),
        i18nKey: 'mn.ip',
        key: 'mnIP',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('mnIP', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('mnIP', options)?.extra
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
        title: intl.formatMessage({ id: 'source.ip.address', defaultMessage: 'Source IP Address' }),
        i18nKey: 'source.ip.address',
        key: 'sourceIPAddress',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('sourceIPAddress', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('sourceIPAddress', options)?.extra
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
        title: intl.formatMessage({ id: 'target.ip,address', defaultMessage: 'Destination IP Address' }),
        i18nKey: 'target.ip,address',
        key: 'targetIPAddress',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('targetIPAddress', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('targetIPAddress', options)?.extra
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
        title: intl.formatMessage({ id: 'entry', defaultMessage: 'Item' }),
        i18nKey: 'entry',
        key: 'entry',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('entry', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('entry', options)?.extra
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
        title: intl.formatMessage({ id: 'value', defaultMessage: 'Value' }),
        i18nKey: 'value',
        key: 'value',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('value', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('value', options)?.extra
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
        title: intl.formatMessage({ id: 'cpu', defaultMessage: 'CPU' }),
        i18nKey: 'cpu',
        key: 'cpuName',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('cpuName', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('cpuName', options)?.extra
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
        title: intl.formatMessage({ id: 'resource.inspection.result', defaultMessage: 'Resource Inspection Results' }),
        i18nKey: 'resource.inspection.result',
        key: 'result',
        width: 140,filters: [],
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('result', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('result', options)?.extra
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
        title: intl.formatMessage({ id: 'license.status', defaultMessage: 'License Status' }),
        i18nKey: 'license.status',
        key: 'licenseStatus',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('licenseStatus', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('licenseStatus', options)?.extra
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
        title: intl.formatMessage({ id: 'expire.time', defaultMessage: 'Expires on' }),
        i18nKey: 'expire.time',
        key: 'expireTime',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('expireTime', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('expireTime', options)?.extra
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
        title: intl.formatMessage({ id: 'bond.name', defaultMessage: 'Bond Name' }),
        i18nKey: 'bond.name',
        key: 'bondName',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('bondName', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('bondName', options)?.extra
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
        title: intl.formatMessage({ id: 'hostIP', defaultMessage: 'Host IP' }),
        i18nKey: 'hostIP',
        key: 'hostIP',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('hostIP', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('hostIP', options)?.extra
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
        title: intl.formatMessage({ id: 'cpu.model', defaultMessage: 'CPU Model' }),
        i18nKey: 'cpu.model',
        key: 'cpuMode',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('cpuMode', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('cpuMode', options)?.extra
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
        title: intl.formatMessage({ id: 'storage.ip', defaultMessage: 'Storage Network IP Address' }),
        i18nKey: 'storage.ip',
        key: 'storageIP',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('storageIP', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('storageIP', options)?.extra
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
        title: intl.formatMessage({ id: 'base.time.server', defaultMessage: 'Base Time Server' }),
        i18nKey: 'base.time.server',
        key: 'baseTimeServer',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('baseTimeServer', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('baseTimeServer', options)?.extra
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
        title: intl.formatMessage({ id: 'current.time.server', defaultMessage: 'Current Time Server' }),
        i18nKey: 'current.time.server',
        key: 'currentTimeServer',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('currentTimeServer', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('currentTimeServer', options)?.extra
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
        title: intl.formatMessage({ id: 'time.source.consistency', defaultMessage: 'Consistent with Time Server' }),
        i18nKey: 'time.source.consistency',
        key: 'timeSourceConsistency',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('timeSourceConsistency', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('timeSourceConsistency', options)?.extra
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
        title: intl.formatMessage({ id: 'time.sync.state', defaultMessage: 'Time Synced' }),
        i18nKey: 'time.sync.state',
        key: 'timeSyncState',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('timeSyncState', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('timeSyncState', options)?.extra
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
        title: intl.formatMessage({ id: 'IPV4.address', defaultMessage: 'IPv4 Address' }),
        i18nKey: 'IPV4.address',
        key: 'IPV4Address',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('IPV4Address', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('IPV4Address', options)?.extra
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
        title: intl.formatMessage({ id: 'backup.server.ip', defaultMessage: 'Backup Storage IP' }),
        i18nKey: 'backup.server.ip',
        key: 'backupServerIP',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('backupServerIP', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('backupServerIP', options)?.extra
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
        title: intl.formatMessage({ id: 'type', defaultMessage: 'Type' }),
        i18nKey: 'type',
        key: 'backupServerMode',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('backupServerMode', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('backupServerMode', options)?.extra
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
        title: intl.formatMessage({ id: 'type', defaultMessage: 'Type' }),
        i18nKey: 'type',
        key: 'type',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('type', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('type', options)?.extra
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
        title: intl.formatMessage({ id: 'usage.rate', defaultMessage: ' Utilization' }),
        i18nKey: 'usage.rate',
        key: 'usageRate',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('usageRate', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('usageRate', options)?.extra
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
        title: intl.formatMessage({ id: 'usage.mount', defaultMessage: 'Usage' }),
        i18nKey: 'usage.mount',
        key: 'usageMount',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('usageMount', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('usageMount', options)?.extra
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
        title: intl.formatMessage({ id: 'remote.backup.server.available.capacity', defaultMessage: 'Available Capacity' }),
        i18nKey: 'remote.backup.server.available.capacity',
        key: 'availableCapacity',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('availableCapacity', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('availableCapacity', options)?.extra
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
        title: intl.formatMessage({ id: 'loss.rate', defaultMessage: 'Packet Loss Rate' }),
        i18nKey: 'loss.rate',
        key: 'lossRate',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('lossRate', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('lossRate', options)?.extra
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
        title: intl.formatMessage({ id: 'net.plugged', defaultMessage: 'Plugged' }),
        i18nKey: 'net.plugged',
        key: 'netPlugged',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('netPlugged', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('netPlugged', options)?.extra
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
        title: intl.formatMessage({ id: 'nic.state', defaultMessage: 'NIC Status' }),
        i18nKey: 'nic.state',
        key: 'nicState',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('nicState', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('nicState', options)?.extra
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
        title: intl.formatMessage({ id: 'vm.count', defaultMessage: 'VMs' }),
        i18nKey: 'vm.count',
        key: 'vmCount',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('vmCount', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('vmCount', options)?.extra
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
        title: intl.formatMessage({ id: 'enable.swap', defaultMessage: 'SWAP Disabled' }),
        i18nKey: 'enable.swap',
        key: 'enableSwap',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('enableSwap', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('enableSwap', options)?.extra
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
        title: intl.formatMessage({ id: 'enable.state', defaultMessage: 'State' }),
        i18nKey: 'enable.state',
        key: 'enableState',
        width: 100,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('enableState', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('enableState', options)?.extra
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
        title: intl.formatMessage({ id: 'whether.conflict', defaultMessage: 'Conflict Found' }),
        i18nKey: 'whether.conflict',
        key: 'whetherConflict',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('whetherConflict', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('whetherConflict', options)?.extra
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
        title: intl.formatMessage({ id: 'enable.heart.beat.detection', defaultMessage: 'Heartbeat Check Enabled' }),
        i18nKey: 'enable.heart.beat.detection',
        key: 'enableHeartBeatDetection',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('enableHeartBeatDetection', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('enableHeartBeatDetection', options)?.extra
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
        title: intl.formatMessage({ id: 'model', defaultMessage: 'Model' }),
        i18nKey: 'model',
        key: 'originMode',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('originMode', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('originMode', options)?.extra
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
        title: intl.formatMessage({ id: 'ready.state', defaultMessage: 'Status' }),
        i18nKey: 'ready.state',
        key: 'readyState',
        width: 100,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('readyState', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('readyState', options)?.extra
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
        title: intl.formatMessage({ id: 'ready.state', defaultMessage: 'Status' }),
        i18nKey: 'ready.state',
        key: 'readyStatus',
        width: 100,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('readyStatus', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('readyStatus', options)?.extra
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
        title: intl.formatMessage({ id: 'ready.state', defaultMessage: 'Status' }),
        i18nKey: 'ready.state',
        key: 'cpuReadyState',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('cpuReadyState', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('cpuReadyState', options)?.extra
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
        title: intl.formatMessage({ id: 'mon.ip', defaultMessage: 'Mon IP' }),
        i18nKey: 'mon.ip',
        key: 'monIP',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('monIP', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('monIP', options)?.extra
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
        title: intl.formatMessage({ id: 'storage.state', defaultMessage: 'State' }),
        i18nKey: 'storage.state',
        key: 'state',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('state', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
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
        title: intl.formatMessage({ id: 'capacity', defaultMessage: 'Capacity' }),
        i18nKey: 'capacity',
        key: 'capacity',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('capacity', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('capacity', options)?.extra
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
        title: intl.formatMessage({ id: 'life.left', defaultMessage: 'Remaining Life Expectancy' }),
        i18nKey: 'life.left',
        key: 'lifeLeft',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('lifeLeft', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('lifeLeft', options)?.extra
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
        title: intl.formatMessage({ id: 'raid.state', defaultMessage: 'RAID Status' }),
        i18nKey: 'raid.state',
        key: 'raidState',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('raidState', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('raidState', options)?.extra
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
        title: intl.formatMessage({ id: 'vm.name', defaultMessage: 'VM Name' }),
        i18nKey: 'vm.name',
        key: 'vmName',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('vmName', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('vmName', options)?.extra
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
        title: intl.formatMessage({ id: 'enable.bond', defaultMessage: 'Bonded' }),
        i18nKey: 'enable.bond',
        key: 'enableBond',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('enableBond', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('enableBond', options)?.extra
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
        title: intl.formatMessage({ id: 'enable.ha', defaultMessage: 'HA Enabled' }),
        i18nKey: 'enable.ha',
        key: 'enableHa',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('enableHa', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('enableHa', options)?.extra
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
        title: intl.formatMessage({ id: 'node.state', defaultMessage: 'Node Status' }),
        i18nKey: 'node.state',
        key: 'nodeState',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('nodeState', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('nodeState', options)?.extra
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
        title: intl.formatMessage({ id: 'snapshot.count', defaultMessage: 'Snapshots' }),
        i18nKey: 'snapshot.count',
        key: 'snapshotCount',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('snapshotCount', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('snapshotCount', options)?.extra
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
        title: intl.formatMessage({ id: 'is.configured', defaultMessage: 'Backup Job Configured' }),
        i18nKey: 'is.configured',
        key: 'isConfigured',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('isConfigured', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('isConfigured', options)?.extra
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
        title: intl.formatMessage({ id: 'backup.ip', defaultMessage: 'Backup Storage IP' }),
        i18nKey: 'backup.ip',
        key: 'backupIP',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('backupIP', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('backupIP', options)?.extra
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
        title: intl.formatMessage({ id: 'is.weak.password', defaultMessage: 'Password Strength' }),
        i18nKey: 'is.weak.password',
        key: 'isWeakPassword',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('isWeakPassword', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('isWeakPassword', options)?.extra
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
        title: intl.formatMessage({ id: 'node.connect.state', defaultMessage: 'Connection Status' }),
        i18nKey: 'node.connect.state',
        key: 'nodeConnectState',
        width: 140,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('nodeConnectState', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('nodeConnectState', options)?.extra
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
        title: intl.formatMessage({ id: 'is.valid', defaultMessage: 'Effective' }),
        i18nKey: 'is.valid',
        key: 'isValid',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('isValid', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('isValid', options)?.extra
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
        title: intl.formatMessage({ id: 'connect,state', defaultMessage: 'Connectivity' }),
        i18nKey: 'connect,state',
        key: 'connectState',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('connectState', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('connectState', options)?.extra
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
        title: intl.formatMessage({ id: 'memory.usage', defaultMessage: ' Memory Utilization' }),
        i18nKey: 'memory.usage',
        key: 'memoryUsage',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('memoryUsage', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('memoryUsage', options)?.extra
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
        title: intl.formatMessage({ id: 'swap.partition.usage', defaultMessage: 'Zombie Utilization' }),
        i18nKey: 'swap.partition.usage',
        key: 'swapUsage',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('swapUsage', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('swapUsage', options)?.extra
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
        title: intl.formatMessage({ id: 'ecc.warning', defaultMessage: 'ECC Warning' }),
        i18nKey: 'ecc.warning',
        key: 'eccWarning',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('eccWarning', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('eccWarning', options)?.extra
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
        title: intl.formatMessage({ id: 'rotate.speed', defaultMessage: 'Rotation Speed' }),
        i18nKey: 'rotate.speed',
        key: 'rpm',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('rpm', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('rpm', options)?.extra
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
        title: intl.formatMessage({ id: 'exist.bad.disk', defaultMessage: 'Bad Sector Found' }),
        i18nKey: 'exist.bad.disk',
        key: 'hddState',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('hddState', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('hddState', options)?.extra
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
        title: intl.formatMessage({ id: 'health.state', defaultMessage: 'Health Status' }),
        i18nKey: 'health.state',
        key: 'healthstate',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('healthstate', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('healthstate', options)?.extra
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
        title: intl.formatMessage({ id: 'io.utilization', defaultMessage: 'IO Utilization' }),
        i18nKey: 'io.utilization',
        key: 'ioUtilization',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ioUtilization', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ioUtilization', options)?.extra
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
        title: intl.formatMessage({ id: 'temperature', defaultMessage: 'Temperature' }),
        i18nKey: 'temperature',
        key: 'temperature',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('temperature', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('temperature', options)?.extra
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
        title: intl.formatMessage({ id: 'package.loss.rate', defaultMessage: 'Packet Loss Rate' }),
        i18nKey: 'package.loss.rate',
        key: 'packageLossRate',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('packageLossRate', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('packageLossRate', options)?.extra
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
        title: intl.formatMessage({ id: 'net.connection.mode', defaultMessage: 'Port Connection Mode' }),
        i18nKey: 'net.connection.mode',
        key: 'netMode',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('netMode', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('netMode', options)?.extra
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
        title: intl.formatMessage({ id: 'net.speed', defaultMessage: 'Port Speed' }),
        i18nKey: 'net.speed',
        key: 'netSpeed',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('netSpeed', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('netSpeed', options)?.extra
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
        title: intl.formatMessage({ id: 'full.duplex.mode', defaultMessage: 'Full Duplex Mode' }),
        i18nKey: 'full.duplex.mode',
        key: 'fullDuplexMode',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('fullDuplexMode', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('fullDuplexMode', options)?.extra
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
        title: intl.formatMessage({ id: 'zombie,process.count', defaultMessage: 'Zombie Processes' }),
        i18nKey: 'zombie,process.count',
        key: 'zombieProcessCount',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('zombieProcessCount', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('zombieProcessCount', options)?.extra
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
        title: intl.formatMessage({ id: 'shut.down.days', defaultMessage: 'Stopped Duration in Days' }),
        i18nKey: 'shut.down.days',
        key: 'shutDownDays',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('shutDownDays', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('shutDownDays', options)?.extra
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
        title: intl.formatMessage({ id: 'cache.mode', defaultMessage: 'Cache Mode' }),
        i18nKey: 'cache.mode',
        key: 'cacheMode',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('cacheMode', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('cacheMode', options)?.extra
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
      'check.L2Network.nic.bond': ['l2NicName', 'result', 'hostIP', 'enableBond'],
      'check.backup.storage.physical.capacity.used': ['result', 'hostIP'],
      'check.backup.storage.reserve.capacity': ['entry', 'value', 'result'],
      'check.backup.storage.status': ['resourceName', 'result', 'type', 'readyStatus'],
      'check.backup.storage.use.physical.capacity': ['resourceName', 'result', 'type', 'usageRate', 'usageMount'],
      'check.blue.screen.configuration': ['result'],
      'check.blue.screen.crash': ['resourceName', 'result', 'IPV4Address', 'enableState'],
      'check.ceph.email': ['result'],
      'check.ceph.primary.storage.mons.status': ['resourceName', 'result', 'monIP', 'nodeConnectState'],
      'check.ceph.primary.storage.status': ['resourceName', 'result', 'state'],
      'check.databases.remote.backup': ['mnIP', 'result', 'isConfigured', 'backupIP', 'isValid'],
      'check.disaster.recovery': ['backupName', 'result', 'backupServerIP', 'backupServerMode', 'usageRate', 'availableCapacity'],
      'check.disk.root.capacity.used': ['resourceName', 'result', 'hostIP', 'usageRate', 'usageMount'],
      'check.host.cpu.load': ['resourceName', 'result', 'hostIP', 'usageRate'],
      'check.host.hdd': ['originName', 'result', 'hostIP', 'originMode', 'capacity', 'rpm', 'hddState', 'healthstate', 'ioUtilization'],
      'check.host.memory.load': ['resourceName', 'result', 'hostIP', 'memoryUsage', 'swapUsage', 'eccWarning'],
      'check.host.net.dev': ['originName', 'result', 'hostIP', 'netPlugged', 'nicState', 'packageLossRate', 'netMode', 'netSpeed', 'fullDuplexMode'],
      'check.host.raid.state': ['originName', 'result', 'hostIP', 'originMode', 'raidState', 'cacheMode'],
      'check.host.real.cpu.status': ['cpuName', 'result', 'hostIP', 'cpuMode', 'cpuReadyState', 'temperature'],
      'check.host.reserve.memory': ['entry', 'value', 'result'],
      'check.host.reverse.memory': ['result'],
      'check.host.ssd': ['originName', 'result', 'hostIP', 'originMode', 'capacity', 'lifeLeft', 'healthstate', 'ioUtilization', 'temperature'],
      'check.host.ssd.life.left': ['diskName', 'hostName', 'result', 'hostIP', 'lifeLeft'],
      'check.host.status': ['resourceName', 'result', 'hostIP', 'readyStatus'],
      'check.host.temperature': ['result'],
      'check.host.zombie.process': ['hostName', 'result', 'hostIP', 'zombieProcessCount'],
      'check.long.stop.vm': ['resourceName', 'result', 'IPV4Address', 'shutDownDays'],
      'check.management.ip.conflict': ['resourceName', 'result', 'hostIP', 'whetherConflict'],
      'check.management.network.packet.loss': ['sourceIPAddress', 'targetIPAddress', 'result', 'lossRate'],
      'check.memory.over.provisioning': ['entry', 'value', 'result'],
      'check.monitoring.data.capacity.utilization': ['mnIP', 'result', 'usageRate', 'usageMount'],
      'check.network.interface.status': ['nicName', 'result', 'bondName', 'hostIP', 'nicState'],
      'check.network.packet.loss': ['sourceIPAddress', 'targetIPAddress', 'result', 'lossRate'],
      'check.network.reachable': ['sourceIPAddress', 'targetIPAddress', 'result', 'connectState'],
      'check.ntp.consistency': ['licenseName', 'result', 'hostIP', 'timeSourceConsistency'],
      'check.password.length': ['resourceName', 'result', 'hostIP', 'isWeakPassword'],
      'check.primary.storage.heart.beat.network': ['resourceName', 'result', 'enableHeartBeatDetection'],
      'check.primary.storage.over.provisioning': ['entry', 'value', 'result'],
      'check.primary.storage.physical.capacity.used': ['result'],
      'check.primary.storage.reserve.capacity': ['entry', 'value', 'result'],
      'check.primary.storage.status': ['resourceName', 'result', 'type', 'readyStatus'],
      'check.primary.storage.threshold': ['entry', 'value', 'result'],
      'check.primary.storage.use.physical.capacity': ['resourceName', 'result', 'type', 'usageRate', 'usageMount'],
      'check.root.capacity.utilization': ['mnIP', 'result', 'usageRate'],
      'check.storage.ip.conflict': ['resourceName', 'result', 'storageIP', 'whetherConflict'],
      'check.storage.network.packet.loss': ['sourceIPAddress', 'targetIPAddress', 'result', 'lossRate'],
      'check.swap.status': ['resourceName', 'result', 'hostIP', 'enableSwap'],
      'check.time.source.configuration': ['resourceName', 'result', 'hostIP', 'baseTimeServer', 'currentTimeServer', 'timeSourceConsistency', 'timeSyncState'],
      'check.time.source.synchronous': ['resourceName', 'result', 'hostIP', 'baseTimeServer', 'currentTimeServer'],
      'check.vm.cpu.average.utilization': ['resourceName', 'result', 'IPV4Address', 'usageRate'],
      'check.vm.cpu.load': ['result'],
      'check.vm.disk.root.utilization': ['resourceName', 'result', 'IPV4Address', 'usageRate'],
      'check.vm.ha.strategy': ['entry', 'value', 'result'],
      'check.vm.not.running.number': ['resourceName', 'result', 'IPV4Address', 'enableState'],
      'check.vm.number.in.host': ['result'],
      'check.vm.volume.snapshot.number': ['resourceName', 'result', 'vmName', 'snapshotCount'],
      'check.zsha2.state': ['mnIP', 'result', 'enableHa', 'nodeState'],
      'check.zstack.license': ['licenseName', 'result', 'licenseStatus', 'expireTime'],
      'get.disk.io.info': ['result'],
      'get.running.vm.info': ['resourceName', 'result', 'hostIP', 'vmCount'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
