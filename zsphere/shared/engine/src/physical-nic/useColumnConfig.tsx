
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'
import { Constant } from '@zstack/design'
import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'interfaceName' | 'lightSwtich' | 'state' | 'interfaceFactory' | 'interfaceModel' | 'nicSpeed' | 'bond' | 'vswitch' | 'ipv4.address' | 'sr.iov.state' | 'used.vf.total.vf' | 'host' | 'carrierActive' | 'virtStatus' | 'vfMark' | 'lLDPMode' | '__action__'

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
        key: 'interfaceName',
        width: 280,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('interfaceName', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('interfaceName', options)?.extra
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
        key: 'lightSwtich',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('lightSwtich', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('lightSwtich', options)?.extra
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
        title: intl.formatMessage({ id: 'common.state', defaultMessage: 'Status' }),
        i18nKey: 'common.state',
        key: 'state',
        width: 100,
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
        title: intl.formatMessage({ id: 'manufacturer', defaultMessage: 'Manufacturer' }),
        i18nKey: 'manufacturer',
        key: 'interfaceFactory',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('interfaceFactory', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('interfaceFactory', options)?.extra
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
        title: intl.formatMessage({ id: 'nicDriveType', defaultMessage: 'NIC Model' }),
        i18nKey: 'nicDriveType',
        key: 'interfaceModel',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('interfaceModel', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('interfaceModel', options)?.extra
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
        title: intl.formatMessage({ id: 'speed', defaultMessage: 'Speed' }),
        i18nKey: 'speed',
        key: 'nicSpeed',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('nicSpeed', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('nicSpeed', options)?.extra
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
        title: intl.formatMessage({ id: 'agg.port', defaultMessage: 'Bond' }),
        i18nKey: 'agg.port',
        key: 'bond',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('bond', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('bond', options)?.extra
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
        title: intl.formatMessage({ id: 'virtualization.l2', defaultMessage: 'Distributed Switch' }),
        i18nKey: 'virtualization.l2',
        key: 'vswitch',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('vswitch', options)?.linkResource || ''
            const val = formatValue('vswitch', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('vswitch', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('vswitch', options)?.extra
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
        title: intl.formatMessage({ id: 'ipv4.address', defaultMessage: 'IPv4 Address' }),
        i18nKey: 'ipv4.address',
        key: 'ipv4.address',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ipv4.address', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ipv4.address', options)?.extra
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
        title: intl.formatMessage({ id: 'sr.iov.state', defaultMessage: 'SR-IOV Status' }),
        i18nKey: 'sr.iov.state',
        key: 'sr.iov.state',
        width: 100,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('sr.iov.state', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('sr.iov.state', options)?.extra
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
        title: intl.formatMessage({ id: 'used.vf.total.vf', defaultMessage: 'Used VF/Total VF' }),
        i18nKey: 'used.vf.total.vf',
        key: 'used.vf.total.vf',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('used.vf.total.vf', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('used.vf.total.vf', options)?.extra
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
        title: intl.formatMessage({ id: 'readyStatus', defaultMessage: 'Status' }),
        i18nKey: 'readyStatus',
        key: 'carrierActive',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('carrierActive', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('carrierActive', options)?.extra
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
        title: intl.formatMessage({ id: 'virtualizationStatus', defaultMessage: 'Virtualization Status' }),
        i18nKey: 'virtualizationStatus',
        key: 'virtStatus',
        width: 140,
        render: (value: any) => {
          const renderText = (value: any) => {
            const val = formatValue('virtStatus', value, options)
            return val || val === 0 ? <Constant value={ val } /> : null
          }
          const renderExtra = getOption('virtStatus', options)?.extra
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
        title: intl.formatMessage({ id: 'virtualNicAvailableCount&#x2F;totalCount', defaultMessage: 'Available vNICs/Total vNICs' }),
        i18nKey: 'virtualNicAvailableCount&#x2F;totalCount',
        key: 'vfMark',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('vfMark', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('vfMark', options)?.extra
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
        title: intl.formatMessage({ id: 'lldp.mode', defaultMessage: 'LLDP Mode' }),
        i18nKey: 'lldp.mode',
        key: 'lLDPMode',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('lLDPMode', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('lLDPMode', options)?.extra
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
      'bond.physicalNic.select': ['interfaceName', 'lightSwtich', 'state', 'interfaceModel', 'nicSpeed', 'bond', 'vswitch', 'ipv4.address', 'virtStatus', 'vfMark'],
      'main': [],
      'select': ['interfaceName', 'state', 'interfaceModel', 'nicSpeed', 'host', 'virtStatus', 'vfMark'],
      'select.bond': ['interfaceName', 'lightSwtich', 'state', 'interfaceModel', 'nicSpeed', 'ipv4.address'],
      'select.sriov.physicalNic': ['interfaceName', 'state', 'nicSpeed', 'vswitch', 'sr.iov.state', 'used.vf.total.vf'],
      'sub': [],
      'sub.bond.physicalNic': ['interfaceName', 'lightSwtich', 'state', 'interfaceModel', 'nicSpeed', 'bond', 'vswitch', 'ipv4.address', 'virtStatus', 'vfMark'],
      'sub.cluster': ['interfaceName', 'state', 'interfaceModel', 'nicSpeed', 'host', 'virtStatus', 'vfMark'],
      'sub.host': ['interfaceName', 'lightSwtich', 'state', 'interfaceModel', 'nicSpeed', 'bond', 'ipv4.address', 'virtStatus', 'vfMark'],
      'sub.host.hyperconverged': ['interfaceName', 'lightSwtich', 'state', 'interfaceModel', 'nicSpeed', 'virtStatus', 'vfMark'],
      'sub.host.virtualization': ['interfaceName', 'lightSwtich', 'state', 'interfaceModel', 'nicSpeed', 'vswitch', 'sr.iov.state', 'used.vf.total.vf', 'lLDPMode'],
      'sub.physicalNetwork': ['interfaceName', 'host'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
