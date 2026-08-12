import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'cluster.usb.rename' | 'cluster.usb.start' | 'cluster.usb.stop' | 'cluster.usb.attach.vm' | 'cluster.usb.detach.vm' | 'host.usb.rename' | 'host.usb.start' | 'host.usb.stop' | 'set.shareType' | 'host.usb.attach.vm' | 'host.usb.detach.vm' | 'vm.attach.usb' | 'vm.detach.usb'

export type IOption<T extends Item, K extends Item = Item> = Array<
  Omit<IMenuItem<T, K>, 'key'> & { key: IKey }
>

function useActionConfig<T extends Item, K extends Item = Item>(
  options: IOption<T, K> = []
): Required<ITableListProps<T, K>>['actionConfig'] {
  const intl = useIntl()

  const _actionConfig: Required<ITableListProps<T, K>>['actionConfig'] = useMemo(() => ({
    list: [
      {
        key: 'cluster.usb.rename',
        name: intl.formatMessage({ id: 'update.usb', defaultMessage: 'Edit Device Name' }),
        auth: {
          authKey: 'cluster.usb.rename',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'cluster.usb.rename-divider',
        divider: true,
      },
      {
        key: 'cluster.usb.start',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'cluster.usb.start',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'cluster.usb.stop',
        name: intl.formatMessage({ id: 'disbale', defaultMessage: 'Disbale' }),
        auth: {
          authKey: 'cluster.usb.stop',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'cluster.usb.attach.vm',
        name: intl.formatMessage({ id: 'attach.vm', defaultMessage: 'Attach Virtual Machine' }),
        auth: {
          authKey: 'cluster.usb.attach.vm',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'cluster.usb.detach.vm',
        name: intl.formatMessage({ id: 'detach.vm', defaultMessage: 'Detach Virtual Machine' }),
        auth: {
          authKey: 'cluster.usb.detach.vm',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'host.usb.rename',
        name: intl.formatMessage({ id: 'update.usb', defaultMessage: 'Edit Device Name' }),
        auth: {
          authKey: 'host.usb.rename',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'host.usb.rename-divider',
        divider: true,
      },
      {
        key: 'host.usb.start',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'host.usb.start',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'host.usb.stop',
        name: intl.formatMessage({ id: 'disbale', defaultMessage: 'Disbale' }),
        auth: {
          authKey: 'host.usb.stop',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'set.shareType',
        name: intl.formatMessage({ id: 'set.share.type', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'set.shareType',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'host.usb.attach.vm',
        name: intl.formatMessage({ id: 'attach.vm', defaultMessage: 'Attach Virtual Machine' }),
        auth: {
          authKey: 'host.usb.attach.vm',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'host.usb.detach.vm',
        name: intl.formatMessage({ id: 'detach.vm', defaultMessage: 'Detach Virtual Machine' }),
        auth: {
          authKey: 'host.usb.detach.vm',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'vm.attach.usb',
        name: intl.formatMessage({ id: 'vm.attach.usb.in.sub', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'vm.attach.usb',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'vm.detach.usb',
        name: intl.formatMessage({ id: 'vm.detach.usb.in.sub', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'vm.detach.usb',
          resource: 'vm',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.cluster/row': {
        extraKeys: [],
        activeKeys: ['cluster.usb.rename', 'cluster.usb.start', 'cluster.usb.stop', 'cluster.usb.attach.vm', 'cluster.usb.detach.vm'],
      },
      'sub.cluster/toolbar': {
        extraKeys: ['cluster.usb.start', 'cluster.usb.stop'],
        activeKeys: [],
      },
      'sub.host/row': {
        extraKeys: [],
        activeKeys: ['host.usb.rename', 'host.usb.start', 'host.usb.stop', 'set.shareType', 'host.usb.attach.vm', 'host.usb.detach.vm'],
      },
      'sub.host/toolbar': {
        extraKeys: ['host.usb.start', 'host.usb.stop'],
        activeKeys: ['set.shareType'],
      },
      'sub.vm/row': {
        extraKeys: [],
        activeKeys: ['vm.detach.usb'],
      },
      'sub.vm/toolbar': {
        extraKeys: ['vm.attach.usb', 'vm.detach.usb'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('usb', intl).then(remoteConfig => {
        console.log(`[RemoteActionConfig]: `, remoteConfig)
        setActionConfig(remoteConfig)
      })
    } else {
      setActionConfig(_actionConfig)
    }
  }, [intl, _actionConfig])

  return useMemo(
    () => ({ ...actionConfig, list: handleActionList(options, actionConfig.list) }),
    [actionConfig, options]
  )
}

export default useActionConfig
