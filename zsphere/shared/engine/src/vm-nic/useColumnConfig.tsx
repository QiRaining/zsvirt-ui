
import React, { useMemo, useState, useEffect } from 'react'
import { useTime } from '@zstack/hooks'
import { Text } from '@zstack/design'
import { useIntl } from 'react-intl'
import type { ITableListProps } from '@zstack/zsphere-components'
import type { Item } from '@zstack/zsphere-types'

import { getOption, formatValue, formatLinkUuid, Link, IColumnType, handleColumnList } from '../../utils'
import { genColumnFromRemote } from '../../core/column/render'

type IKey = 'nicName' | 'name' | 'name.in.router' | 'name.in.bm2' | 'mac' | 'type.in.bm2' | 'ipv4' | 'ipv6' | 'state' | 'virtualization.ipv4.address' | 'virtualization.ipv6.address' | 'securityGroup' | 'eip' | 'driverType' | 'type' | 'portGroup' | 'vmName' | 'cidr' | 'ipv4Cidr' | 'ipv6Cidr' | 'ipCapacity' | 'ipv4Capacity' | 'state.in.router' | 'snat' | 'outboundBandwidth.in.router' | 'inboundBandwidth.in.router' | 'isPxe' | 'network' | 'baremetal2.instance' | 'ip.address' | 'netmask' | 'gateway' | 'virtualization.mtu' | 'outboundBandwidth' | 'inboundBandwidth' | 'createDate' | 'virtualization.mac.address' | 'virtualization.dns' | '__action__'

export type IOption<T extends Item> = Array<Omit<IColumnType<T>, 'key'> & { key: IKey }>

function useColumnConfig<T extends Item>(
  options:IOption<T> = []
): ITableListProps<T>['columnConfig'] {
  const intl = useIntl()

  const { getServerTime } = useTime()

  const _columnConfig: ITableListProps<T>['columnConfig'] = useMemo(() => ({
    list: [
      {
        title: intl.formatMessage({ id: 'nic', defaultMessage: 'NIC' }),
        i18nKey: 'nic',
        key: 'nicName',
        width: 200,
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
        title: intl.formatMessage({ id: 'name', defaultMessage: 'Name' }),
        i18nKey: 'name',
        key: 'name.in.router',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('name.in.router', options)?.linkResource || ''
            const val = formatValue('name.in.router', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('name.in.router', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('name.in.router', options)?.extra
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
        title: intl.formatMessage({ id: 'name', defaultMessage: 'Name' }),
        i18nKey: 'name',
        key: 'name.in.bm2',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('name.in.bm2', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('name.in.bm2', options)?.extra
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
        title: intl.formatMessage({ id: 'macAddress', defaultMessage: 'MAC Address' }),
        i18nKey: 'macAddress',
        key: 'mac',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('mac', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('mac', options)?.extra
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
        title: intl.formatMessage({ id: 'deviceType', defaultMessage: 'Device Type' }),
        i18nKey: 'deviceType',
        key: 'type.in.bm2',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('type.in.bm2', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('type.in.bm2', options)?.extra
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
        title: intl.formatMessage({ id: 'ipv4Address', defaultMessage: 'IPv4 Address' }),
        i18nKey: 'ipv4Address',
        key: 'ipv4',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ipv4', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ipv4', options)?.extra
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
        title: intl.formatMessage({ id: 'ipv6Address', defaultMessage: 'IPv6 Address' }),
        i18nKey: 'ipv6Address',
        key: 'ipv6',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ipv6', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ipv6', options)?.extra
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
        key: 'state',
        width: 140,filters: [],
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
        title: intl.formatMessage({ id: 'ipv4.address', defaultMessage: 'IPv4 Address' }),
        i18nKey: 'ipv4.address',
        key: 'virtualization.ipv4.address',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('virtualization.ipv4.address', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('virtualization.ipv4.address', options)?.extra
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
        title: intl.formatMessage({ id: 'ipv6.address', defaultMessage: 'IPv6 Address' }),
        i18nKey: 'ipv6.address',
        key: 'virtualization.ipv6.address',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('virtualization.ipv6.address', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('virtualization.ipv6.address', options)?.extra
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
        title: intl.formatMessage({ id: 'security.group', defaultMessage: 'Security Group' }),
        i18nKey: 'security.group',
        key: 'securityGroup',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('securityGroup', options)?.linkResource || ''
            const val = formatValue('securityGroup', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('securityGroup', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('securityGroup', options)?.extra
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
        title: intl.formatMessage({ id: 'eip', defaultMessage: 'EIP' }),
        i18nKey: 'eip',
        key: 'eip',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('eip', options)?.linkResource || ''
            const val = formatValue('eip', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('eip', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('eip', options)?.extra
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
        title: intl.formatMessage({ id: 'nicDriveType', defaultMessage: 'NIC Model' }),
        i18nKey: 'nicDriveType',
        key: 'driverType',
        width: 140,filters: [],
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('driverType', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('driverType', options)?.extra
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
        title: intl.formatMessage({ id: 'nicType', defaultMessage: 'NIC Type' }),
        i18nKey: 'nicType',
        key: 'type',
        width: 140,filters: [],
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
        title: intl.formatMessage({ id: 'portGroup', defaultMessage: 'Distributed Port Group' }),
        i18nKey: 'portGroup',
        key: 'portGroup',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('portGroup', options)?.linkResource || ''
            const val = formatValue('portGroup', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('portGroup', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('portGroup', options)?.extra
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
        title: intl.formatMessage({ id: 'associated.object', defaultMessage: 'Associated Objects' }),
        i18nKey: 'associated.object',
        key: 'vmName',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('vmName', options)?.linkResource || ''
            const val = formatValue('vmName', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('vmName', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('vmName', options)?.extra
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
        title: intl.formatMessage({ id: 'cidr', defaultMessage: 'CIDR' }),
        i18nKey: 'cidr',
        key: 'cidr',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('cidr', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('cidr', options)?.extra
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
        title: intl.formatMessage({ id: 'ipv4Cidr', defaultMessage: 'IPv4 CIDR' }),
        i18nKey: 'ipv4Cidr',
        key: 'ipv4Cidr',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ipv4Cidr', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ipv4Cidr', options)?.extra
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
        title: intl.formatMessage({ id: 'ipv6Cidr', defaultMessage: 'IPv6 CIDR' }),
        i18nKey: 'ipv6Cidr',
        key: 'ipv6Cidr',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ipv6Cidr', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ipv6Cidr', options)?.extra
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
        title: intl.formatMessage({ id: 'ipCapacity', defaultMessage: 'Available IP' }),
        i18nKey: 'ipCapacity',
        key: 'ipCapacity',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ipCapacity', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ipCapacity', options)?.extra
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
        title: intl.formatMessage({ id: 'ipv4Capacity', defaultMessage: 'Available IPv4' }),
        i18nKey: 'ipv4Capacity',
        key: 'ipv4Capacity',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ipv4Capacity', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ipv4Capacity', options)?.extra
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
        key: 'state.in.router',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('state.in.router', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('state.in.router', options)?.extra
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
        title: intl.formatMessage({ id: 'SNAT', defaultMessage: 'SNAT' }),
        i18nKey: 'SNAT',
        key: 'snat',
        width: 100,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('snat', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('snat', options)?.extra
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
        title: intl.formatMessage({ id: 'networkInterfaceOutboundBandwidth', defaultMessage: 'NIC Upstream Bandwidth' }),
        i18nKey: 'networkInterfaceOutboundBandwidth',
        key: 'outboundBandwidth.in.router',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('outboundBandwidth.in.router', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('outboundBandwidth.in.router', options)?.extra
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
        title: intl.formatMessage({ id: 'networkInterfaceInboundBandwidth', defaultMessage: 'NIC Downstream Bandwidth' }),
        i18nKey: 'networkInterfaceInboundBandwidth',
        key: 'inboundBandwidth.in.router',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('inboundBandwidth.in.router', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('inboundBandwidth.in.router', options)?.extra
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
        title: intl.formatMessage({ id: 'pxeStartNic', defaultMessage: 'PXE Boot NIC' }),
        i18nKey: 'pxeStartNic',
        key: 'isPxe',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('isPxe', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('isPxe', options)?.extra
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
        title: intl.formatMessage({ id: 'network', defaultMessage: 'Network' }),
        i18nKey: 'network',
        key: 'network',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const linkResource = getOption('network', options)?.linkResource || ''
            const val = formatValue('network', value, options)
            return val || val === 0 ? (
              <Text>
                <Link to={ linkResource } uuid={formatLinkUuid('network', value, options)} >{ val }</Link>
              </Text>
            ) : null
          }
          const renderExtra = getOption('network', options)?.extra
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
        title: intl.formatMessage({ id: 'baremetal2.instance', defaultMessage: 'Elastic Baremetal Instance' }),
        i18nKey: 'baremetal2.instance',
        key: 'baremetal2.instance',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('baremetal2.instance', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('baremetal2.instance', options)?.extra
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
        title: intl.formatMessage({ id: 'ipAddress', defaultMessage: 'IP Address' }),
        i18nKey: 'ipAddress',
        key: 'ip.address',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('ip.address', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('ip.address', options)?.extra
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
        title: intl.formatMessage({ id: 'netmask', defaultMessage: 'Netmask' }),
        i18nKey: 'netmask',
        key: 'netmask',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('netmask', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('netmask', options)?.extra
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
        title: intl.formatMessage({ id: 'gateway', defaultMessage: 'Gateway' }),
        i18nKey: 'gateway',
        key: 'gateway',
        width: 200,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('gateway', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('gateway', options)?.extra
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
        title: intl.formatMessage({ id: 'virtualization.mtu', defaultMessage: 'MTU' }),
        i18nKey: 'virtualization.mtu',
        key: 'virtualization.mtu',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('virtualization.mtu', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('virtualization.mtu', options)?.extra
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
        title: intl.formatMessage({ id: 'outboundBandwidth', defaultMessage: 'Upstream Bandwidth' }),
        i18nKey: 'outboundBandwidth',
        key: 'outboundBandwidth',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('outboundBandwidth', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('outboundBandwidth', options)?.extra
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
        title: intl.formatMessage({ id: 'inboundBandwidth', defaultMessage: 'Downstream Bandwidth' }),
        i18nKey: 'inboundBandwidth',
        key: 'inboundBandwidth',
        width: 140,sorter: true,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('inboundBandwidth', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('inboundBandwidth', options)?.extra
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
        title: intl.formatMessage({ id: 'createDate', defaultMessage: 'Creation Time' }),
        i18nKey: 'createDate',
        key: 'createDate',
        width: 200,
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
      {
        title: intl.formatMessage({ id: 'virtualization.mac.address', defaultMessage: 'MAC Address' }),
        i18nKey: 'virtualization.mac.address',
        key: 'virtualization.mac.address',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('virtualization.mac.address', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('virtualization.mac.address', options)?.extra
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
        title: intl.formatMessage({ id: 'virtualization.dns', defaultMessage: 'DNS' }),
        i18nKey: 'virtualization.dns',
        key: 'virtualization.dns',
        width: 140,
        render: (value:any) => {
          const renderText = (value: any) => {
            const val = formatValue('virtualization.dns', value, options)
            return val || val === 0 ? <Text>{ val }</Text> : null
          }
          const renderExtra = getOption('virtualization.dns', options)?.extra
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
      'main': ['name', 'mac', 'ipv4', 'ipv6', 'eip', 'driverType', 'type', 'outboundBandwidth', 'inboundBandwidth'],
      'select': ['nicName', 'name', 'mac', 'ipv4', 'ipv6', 'state', 'driverType', 'type', 'outboundBandwidth', 'inboundBandwidth'],
      'select.baremetal2.instance': ['mac', 'baremetal2.instance', 'ip.address'],
      'select.eip': ['nicName', 'mac', 'ipv4', 'state'],
      'select.port-forwarding': ['nicName', 'mac', 'state', 'ip.address'],
      'select.server-group': ['name', 'ipv4', 'state', 'vmName'],
      'select.sg': ['nicName', 'mac', 'ipv4', 'ipv6', 'state', 'portGroup', 'vmName'],
      'select.virtualization.vm': ['name', 'state', 'virtualization.ipv4.address', 'virtualization.ipv6.address', 'netmask', 'gateway', 'virtualization.mtu', 'virtualization.mac.address', 'virtualization.dns'],
      'sub': ['name', 'mac', 'ipv4', 'ipv6', 'state', 'securityGroup', 'eip', 'driverType', 'type', 'outboundBandwidth', 'inboundBandwidth'],
      'sub.baremetal2.instance': ['name.in.bm2', 'mac', 'type.in.bm2', 'network', 'ip.address', 'netmask', 'gateway'],
      'sub.baremetal2.instance.arrangeNic': ['name.in.bm2', 'mac', 'type.in.bm2', 'network', 'ip.address'],
      'sub.node': ['name', 'mac', 'ipv4'],
      'sub.sg': ['nicName', 'ipv4', 'ipv6', 'state', 'portGroup', 'vmName'],
      'sub.vcenter': ['name', 'mac', 'ipv4', 'driverType', 'type'],
      'sub.vcenter.router': ['name.in.router', 'ipv4Cidr', 'ipv6Cidr', 'ipv4Capacity', 'outboundBandwidth.in.router', 'inboundBandwidth.in.router', 'createDate'],
      'sub.vpcrouter.manage': ['name.in.router', 'cidr', 'ipCapacity', 'createDate'],
      'sub.vpcrouter.public': ['name.in.router', 'ipv4Cidr', 'ipv6Cidr', 'ipv4Capacity', 'state.in.router', 'snat', 'outboundBandwidth.in.router', 'inboundBandwidth.in.router', 'createDate'],
      'sub.vpcrouter.vpc': ['name.in.router', 'ipv4Cidr', 'ipv6Cidr', 'ipv4Capacity', 'state.in.router', 'outboundBandwidth.in.router', 'inboundBandwidth.in.router', 'createDate'],
    }
  }), [intl, getServerTime])

  return useMemo(
    () => ({ ..._columnConfig, list: handleColumnList(options, _columnConfig.list) }),
    [options, _columnConfig]
  )
}

export default useColumnConfig
