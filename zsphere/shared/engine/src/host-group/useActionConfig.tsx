import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.host.group' | 'edit' | 'add.host' | 'remove.host' | 'delete'

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
        key: 'create.host.group',
        name: intl.formatMessage({ id: 'create.hostGroup', defaultMessage: 'New Host Scheduling Group' }),
        auth: {
          authKey: 'create.host.group',
          resource: 'host.group',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'host.group',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'add.host',
        name: intl.formatMessage({ id: 'add.host', defaultMessage: 'Add Host' }),
        auth: {
          authKey: 'add.host',
          resource: 'host.group',
          type: 'action'
        },
      },
      {
        key: 'remove.host',
        name: intl.formatMessage({ id: 'remove.host', defaultMessage: 'Remove Host' }),
        auth: {
          authKey: 'remove.host',
          resource: 'host.group',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'host.group',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'add.host', 'remove.host', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'add.host', 'remove.host', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.host.group', 'delete'],
        activeKeys: [],
      },
      'virtualization.main/header': {
        extraKeys: ['edit'],
        activeKeys: ['add.host', 'remove.host', 'delete'],
      },
      'virtualization.main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'add.host', 'remove.host', 'delete'],
      },
      'virtualization.main/toolbar': {
        extraKeys: ['create.host.group', 'delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('host-group', intl).then(remoteConfig => {
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
