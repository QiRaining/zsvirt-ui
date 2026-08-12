
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'
import { Constant } from '@zstack/design'
import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'device' | 'state' | 'model' | 'diskType' | 'serialNumber' | 'size' | 'slotNumber' | 'interfaceType' | 'diskUsage' | 'ssdRemainingLife' | 'temperature' | 'rotateSpeed' | 'lightSwitch' | '__action__'

export type IOption<T extends Item> = Array<Omit<IColumnType<T>, 'key'> & { key: IKey }>

function useColumnConfig<T extends Item>(
  options:IOption<T> = []
): ITableListProps<T>['columnConfig'] {
  const intl = useIntl()

  const { getServerTime } = useTime()

  const _columnConfig: ITableListProps<T>['columnConfig'] = useMemo(() => ({
    list: [
      {
        title: intl.formatMessage({ id: 'device', defaultMessage: 'Device' }),
        i18nKey: 'device',
        key: 'device',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('device', options)?.linkResource || ''
            const val = formatValue('device', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('device', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('device', options)?.extra
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
        title: intl.formatMessage({ id: 'common.state', defaultMessage: 'Status' }),
        i18nKey: 'common.state',
        key: 'state',
        width: 140,
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
        title: intl.formatMessage({ id: 'model', defaultMessage: 'Model' }),
        i18nKey: 'model',
        key: 'model',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('model', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('model', options)?.extra
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
        key: 'diskType',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('diskType', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('diskType', options)?.extra
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
        title: intl.formatMessage({ id: 'serial.number', defaultMessage: 'Serial Number' }),
        i18nKey: 'serial.number',
        key: 'serialNumber',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('serialNumber', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('serialNumber', options)?.extra
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
        width: 140,
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
        title: intl.formatMessage({ id: 'slotNumber', defaultMessage: 'Slot Number' }),
        i18nKey: 'slotNumber',
        key: 'slotNumber',
        width: 100,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('slotNumber', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('slotNumber', options)?.extra
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
        title: intl.formatMessage({ id: 'interface.type', defaultMessage: 'Interface Type' }),
        i18nKey: 'interface.type',
        key: 'interfaceType',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('interfaceType', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('interfaceType', options)?.extra
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
        title: intl.formatMessage({ id: 'diskUsage', defaultMessage: 'Disk Usage' }),
        i18nKey: 'diskUsage',
        key: 'diskUsage',
        width: 100,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('diskUsage', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('diskUsage', options)?.extra
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
        title: intl.formatMessage({ id: 'ssdRemainingLife', defaultMessage: 'SSD Remaining Lifespan' }),
        i18nKey: 'ssdRemainingLife',
        key: 'ssdRemainingLife',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ssdRemainingLife', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ssdRemainingLife', options)?.extra
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
        title: intl.formatMessage({ id: 'ssd.temperature', defaultMessage: 'SSD Temperature' }),
        i18nKey: 'ssd.temperature',
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
        title: intl.formatMessage({ id: 'rotate.speed', defaultMessage: 'Rotation Speed' }),
        i18nKey: 'rotate.speed',
        key: 'rotateSpeed',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('rotateSpeed', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('rotateSpeed', options)?.extra
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
        title: intl.formatMessage({ id: 'lightOn', defaultMessage: 'Light Up' }),
        i18nKey: 'lightOn',
        key: 'lightSwitch',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('lightSwitch', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('lightSwitch', options)?.extra
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
      'hdd': ['model', 'size', 'slotNumber', 'interfaceType', 'rotateSpeed', 'lightSwitch'],
      'main': ['device', 'state', 'model', 'diskType', 'serialNumber', 'size'],
      'ssd': ['size', 'slotNumber', 'interfaceType', 'diskUsage', 'ssdRemainingLife', 'temperature', 'lightSwitch'],
      'sub.host': ['diskType', 'size', 'slotNumber', 'diskUsage', 'ssdRemainingLife', 'lightSwitch'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
