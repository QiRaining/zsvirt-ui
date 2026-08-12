import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'add.baremetal.chassis' | 'add.baremetal.instance' | 'create.baremetal.cluster' | 'edit' | 'enable' | 'disable' | 'create.l2Network' | 'attach.l2network' | 'detach.l2network' | 'config.pxeServer' | 'reconnect.pxe.server' | 'detach.pxe.server' | 'delete' | 'attach.in.pxe.server' | 'detach.in.pxe.server' | 'attach.in.l2network' | 'detach.in.l2network'

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
        key: 'add.baremetal.chassis',
        name: intl.formatMessage({ id: 'add.baremetal.chassis', defaultMessage: 'Add Bare Metal Chassis' }),
        auth: {
          authKey: 'add.baremetal.chassis',
          resource: 'baremetal.cluster',
          type: 'action'
        },
      },
      {
        key: 'add.baremetal.chassis-divider',
        divider: true,
      },
      {
        key: 'add.baremetal.instance',
        name: intl.formatMessage({ id: 'add.baremetal.instance', defaultMessage: 'New Bare Metal Instance' }),
        auth: {
          authKey: 'add.baremetal.instance',
          resource: 'baremetal.cluster',
          type: 'action'
        },
      },
      {
        key: 'create.baremetal.cluster',
        name: intl.formatMessage({ id: 'create.baremetal.cluster', defaultMessage: 'New Bare Metal Cluster' }),
        auth: {
          authKey: 'create.baremetal.cluster',
          resource: 'baremetal.cluster',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit.name.and.desc', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'edit',
          resource: 'baremetal.cluster',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'baremetal.cluster',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'baremetal.cluster',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'disable-divider',
        divider: true,
      },
      {
        key: 'create.l2Network',
        name: intl.formatMessage({ id: 'create.l2Network', defaultMessage: 'New Distributed Switch' }),
        auth: {
          authKey: 'create.l2Network',
          resource: 'baremetal.cluster',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'attach.l2network',
        name: intl.formatMessage({ id: 'attach.l2Network', defaultMessage: 'Attach Distributed Switch' }),
        auth: {
          authKey: 'attach.l2network',
          resource: 'baremetal.cluster',
          type: 'action'
        },
      },
      {
        key: 'detach.l2network',
        name: intl.formatMessage({ id: 'detach.l2Network', defaultMessage: 'Detach Distributed Switch' }),
        auth: {
          authKey: 'detach.l2network',
          resource: 'baremetal.cluster',
          type: 'action'
        },
      },
      {
        key: 'detach.l2network-divider',
        divider: true,
      },
      {
        key: 'config.pxeServer',
        name: intl.formatMessage({ id: 'config.pxeServer', defaultMessage: 'Attach Deployment Server' }),
        auth: {
          authKey: 'config.pxeServer',
          resource: 'baremetal.cluster',
          type: 'action'
        },
      },
      {
        key: 'reconnect.pxe.server',
        name: intl.formatMessage({ id: 'reconnect.pxe.server', defaultMessage: 'Reconnect Deployment Server' }),
        auth: {
          authKey: 'reconnect.pxe.server',
          resource: 'baremetal.cluster',
          type: 'action'
        },
      },
      {
        key: 'detach.pxe.server',
        name: intl.formatMessage({ id: 'detach.pxeServer', defaultMessage: 'Detach Deployment Server' }),
        auth: {
          authKey: 'detach.pxe.server',
          resource: 'baremetal.cluster',
          type: 'action'
        },
      },
      {
        key: 'detach.pxe.server-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'baremetal.cluster',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'attach.in.pxe.server',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.in.pxe.server',
          resource: 'baremetal.cluster',
          type: 'action'
        },
      },
      {
        key: 'detach.in.pxe.server',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.in.pxe.server',
          resource: 'baremetal.cluster',
          type: 'action'
        },
      },
      {
        key: 'attach.in.l2network',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.in.l2network',
          resource: 'baremetal.cluster',
          type: 'action'
        },
      },
      {
        key: 'detach.in.l2network',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.in.l2network',
          resource: 'baremetal.cluster',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['add.baremetal.chassis', 'add.baremetal.instance', 'edit', 'create.l2Network', 'attach.l2network', 'detach.l2network', 'config.pxeServer', 'reconnect.pxe.server', 'detach.pxe.server', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['add.baremetal.chassis', 'edit', 'create.l2Network', 'attach.l2network', 'detach.l2network', 'config.pxeServer', 'reconnect.pxe.server', 'detach.pxe.server', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.baremetal.cluster', 'delete'],
        activeKeys: [],
      },
      'sub.l2.network/row': {
        extraKeys: [],
        activeKeys: ['detach.in.l2network'],
      },
      'sub.l2.network/toolbar': {
        extraKeys: ['attach.in.l2network', 'detach.in.l2network'],
        activeKeys: [],
      },
      'sub.pxe.server/row': {
        extraKeys: [],
        activeKeys: ['detach.in.pxe.server'],
      },
      'sub.pxe.server/toolbar': {
        extraKeys: ['attach.in.pxe.server', 'detach.in.pxe.server'],
        activeKeys: [],
      },
      'sub.virtualization.iscsi.server/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.zone/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'create.l2Network', 'attach.l2network', 'detach.l2network', 'delete'],
      },
      'sub.zone/toolbar': {
        extraKeys: ['enable', 'disable', 'delete'],
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
      'virtualization.dir/directory': {
        extraKeys: [],
        activeKeys: ['add.baremetal.chassis', 'add.baremetal.instance', 'edit', 'create.l2Network', 'attach.l2network', 'detach.l2network', 'config.pxeServer', 'reconnect.pxe.server', 'detach.pxe.server', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('baremetal-cluster', intl).then(remoteConfig => {
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
