import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'edit' | 'create.server.group' | 'attach.listener' | 'detach.listener' | 'delete'

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
          resource: 'server.group',
          type: 'action'
        },
      },
      {
        key: 'create.server.group',
        name: intl.formatMessage({ id: 'create.serverGroup', defaultMessage: 'Create Backend Server Group' }),
        auth: {
          authKey: 'create.server.group',
          resource: 'server.group',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'attach.listener',
        name: intl.formatMessage({ id: 'associate', defaultMessage: 'Associate' }),
        auth: {
          authKey: 'attach.listener',
          resource: 'server.group',
          type: 'action'
        },
      },
      {
        key: 'detach.listener',
        name: intl.formatMessage({ id: 'disassociate', defaultMessage: 'Disassociate' }),
        auth: {
          authKey: 'detach.listener',
          resource: 'server.group',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'server.group',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.server.group', 'delete'],
        activeKeys: [],
      },
      'sub.listener/row': {
        extraKeys: [],
        activeKeys: ['detach.listener'],
      },
      'sub.listener/toolbar': {
        extraKeys: ['attach.listener', 'detach.listener'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['delete'],
      },
      'sub/toolbar': {
        extraKeys: ['create.server.group', 'delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('server-group', intl).then(remoteConfig => {
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
