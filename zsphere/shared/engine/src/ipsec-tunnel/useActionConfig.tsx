import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'ipsec.tunnel.create' | 'edit' | 'reconnect' | 'change.config' | 'delete'

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
        key: 'ipsec.tunnel.create',
        name: intl.formatMessage({ id: 'create.ipsecTunnel', defaultMessage: 'Create IPsec Tunnel' }),
        auth: {
          authKey: 'ipsec.tunnel.create',
          resource: 'ipsec.tunnel',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'ipsec.tunnel',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'reconnect',
        name: intl.formatMessage({ id: 'reconnection', defaultMessage: 'Reconnect' }),
        auth: {
          authKey: 'reconnect',
          resource: 'ipsec.tunnel',
          type: 'action'
        },
      },
      {
        key: 'change.config',
        name: intl.formatMessage({ id: 'change.configuration', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'change.config',
          resource: 'ipsec.tunnel',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'ipsec.tunnel',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'reconnect', 'change.config', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'reconnect', 'change.config', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['ipsec.tunnel.create', 'delete'],
        activeKeys: [],
      },
      'sub.vpc/row': {
        extraKeys: ['delete'],
        activeKeys: [],
      },
      'sub.vpc/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: ['delete'],
        activeKeys: [],
      },
      'sub/toolbar': {
        extraKeys: ['ipsec.tunnel.create', 'delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('ipsec-tunnel', intl).then(remoteConfig => {
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
