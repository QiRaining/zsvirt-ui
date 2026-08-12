import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'edit' | 'add.gateway' | 'enable' | 'disable' | 'reconnect' | 'update.password' | 'update.cluster' | 'delete'

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
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'baremetal2.gateway',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'add.gateway',
        name: intl.formatMessage({ id: 'add.gateway', defaultMessage: 'Add Gateway Node' }),
        auth: {
          authKey: 'add.gateway',
          resource: 'baremetal2.gateway',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'baremetal2.gateway',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'baremetal2.gateway',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'reconnect',
        name: intl.formatMessage({ id: 'reconnect', defaultMessage: 'Reconnect' }),
        auth: {
          authKey: 'reconnect',
          resource: 'baremetal2.gateway',
          type: 'action'
        },
      },
      {
        key: 'update.password',
        name: intl.formatMessage({ id: 'change.password', defaultMessage: 'Change Password' }),
        auth: {
          authKey: 'update.password',
          resource: 'baremetal2.gateway',
          type: 'action'
        },
      },
      {
        key: 'update.cluster',
        name: intl.formatMessage({ id: 'update.baremetal2Cluster', defaultMessage: 'Change Elastic Baremetal Cluster' }),
        auth: {
          authKey: 'update.cluster',
          resource: 'baremetal2.gateway',
          type: 'action'
        },
      },
      {
        key: 'update.cluster-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'baremetal2.gateway',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['edit', 'reconnect', 'update.password', 'update.cluster', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'reconnect', 'update.password', 'update.cluster', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['add.gateway', 'enable', 'disable', 'delete'],
        activeKeys: [],
      },
      'sub.baremetal2.cluster/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.baremetal2.cluster/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.provision.network/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.provision.network/toolbar': {
        extraKeys: [],
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
      genActionFromRemote('baremetal2-gateway', intl).then(remoteConfig => {
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
