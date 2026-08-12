import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'add.iscsi.server' | 'virtualization.add.iscsi.server' | 'edit' | 'enable' | 'disable' | 'attach.cluster' | 'detach.cluster' | 'refresh.iscsi.server' | 'add.data.storage' | 'delete' | 'cluster.attach.iscsiStorage' | 'cluster.detach.iscsiStorage' | 'baremetal2cluster.attach.iscsiStorage' | 'baremetal2cluster.detach.iscsiStorage'

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
        key: 'add.iscsi.server',
        name: intl.formatMessage({ id: 'add.iscsi', defaultMessage: 'Add iSCSI Storage' }),
        auth: {
          authKey: 'add.iscsi.server',
          resource: 'iscsi.server',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'virtualization.add.iscsi.server',
        name: intl.formatMessage({ id: 'add.iscsi', defaultMessage: 'Add iSCSI Storage' }),
        auth: {
          authKey: 'virtualization.add.iscsi.server',
          resource: 'iscsi.server',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'iscsi.server',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'iscsi.server',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'iscsi.server',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'attach.cluster',
        name: intl.formatMessage({ id: 'attach.cluster', defaultMessage: 'Attach Cluster' }),
        auth: {
          authKey: 'attach.cluster',
          resource: 'iscsi.server',
          type: 'action'
        },
      },
      {
        key: 'detach.cluster',
        name: intl.formatMessage({ id: 'detach.cluster', defaultMessage: 'Detach Cluster' }),
        auth: {
          authKey: 'detach.cluster',
          resource: 'iscsi.server',
          type: 'action'
        },
      },
      {
        key: 'refresh.iscsi.server',
        name: intl.formatMessage({ id: 'refresh.iscsi', defaultMessage: 'Sync Data' }),
        auth: {
          authKey: 'refresh.iscsi.server',
          resource: 'iscsi.server',
          type: 'action'
        },
      },
      {
        key: 'refresh.iscsi.server-divider',
        divider: true,
      },
      {
        key: 'add.data.storage',
        name: intl.formatMessage({ id: 'add.data.storage', defaultMessage: 'Add Data Storage' }),
        auth: {
          authKey: 'add.data.storage',
          resource: 'iscsi.server',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'iscsi.server',
          type: 'action'
        },
      },
      {
        key: 'cluster.attach.iscsiStorage',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'cluster.attach.iscsiStorage',
          resource: 'iscsi.server',
          type: 'action'
        },
      },
      {
        key: 'cluster.detach.iscsiStorage',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'cluster.detach.iscsiStorage',
          resource: 'iscsi.server',
          type: 'action'
        },
      },
      {
        key: 'baremetal2cluster.attach.iscsiStorage',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'baremetal2cluster.attach.iscsiStorage',
          resource: 'iscsi.server',
          type: 'action'
        },
      },
      {
        key: 'baremetal2cluster.detach.iscsiStorage',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'baremetal2cluster.detach.iscsiStorage',
          resource: 'iscsi.server',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'attach.cluster', 'detach.cluster', 'refresh.iscsi.server', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'attach.cluster', 'detach.cluster', 'refresh.iscsi.server', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['add.iscsi.server', 'refresh.iscsi.server', 'delete'],
        activeKeys: [],
      },
      'sub.baremetal2Cluster/toolbar': {
        extraKeys: ['baremetal2cluster.attach.iscsiStorage', 'baremetal2cluster.detach.iscsiStorage'],
        activeKeys: [],
      },
      'sub.baremetal3Cluster/row': {
        extraKeys: [],
        activeKeys: ['baremetal2cluster.detach.iscsiStorage'],
      },
      'sub.cluster/row': {
        extraKeys: [],
        activeKeys: ['cluster.detach.iscsiStorage'],
      },
      'sub.cluster/toolbar': {
        extraKeys: ['cluster.attach.iscsiStorage', 'cluster.detach.iscsiStorage'],
        activeKeys: [],
      },
      'sub.virtualization.data.storage/header': {
        extraKeys: ['edit'],
        activeKeys: ['refresh.iscsi.server', 'add.data.storage', 'delete'],
      },
      'sub.virtualization.zone/toolbar': {
        extraKeys: ['virtualization.add.iscsi.server'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['edit', 'attach.cluster', 'detach.cluster'],
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
      genActionFromRemote('iscsi-server', intl).then(remoteConfig => {
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
