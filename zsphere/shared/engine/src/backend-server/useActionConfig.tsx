import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'edit' | 'add.backend.server' | 'set.weight' | 'remove'

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
          resource: 'backend.server',
          type: 'action'
        },
      },
      {
        key: 'add.backend.server',
        name: intl.formatMessage({ id: 'add.backendServer', defaultMessage: 'Add Backend Server' }),
        auth: {
          authKey: 'add.backend.server',
          resource: 'load.balancer',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'set.weight',
        name: intl.formatMessage({ id: 'set.weight', defaultMessage: 'Set Weight' }),
        auth: {
          authKey: 'set.weight',
          resource: 'backend.server',
          type: 'action'
        },
      },
      {
        key: 'remove',
        name: intl.formatMessage({ id: 'remove', defaultMessage: 'Remove' }),
        auth: {
          authKey: 'remove',
          resource: 'load.balancer',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'remove'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'remove'],
      },
      'main/toolbar': {
        extraKeys: ['add.backend.server', 'set.weight', 'remove'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['remove'],
      },
      'sub/toolbar': {
        extraKeys: ['add.backend.server', 'set.weight', 'remove'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('backend-server', intl).then(remoteConfig => {
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
