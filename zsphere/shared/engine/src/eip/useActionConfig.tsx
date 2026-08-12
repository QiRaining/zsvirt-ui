import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.eip' | 'edit' | 'attacth.eip' | 'detach.eip' | 'owner.eip.change' | 'delete'

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
        key: 'create.eip',
        name: intl.formatMessage({ id: 'create.eip', defaultMessage: 'Create EIP' }),
        auth: {
          authKey: 'create.eip',
          resource: 'eip',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'eip',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'attacth.eip',
        name: intl.formatMessage({ id: 'bind.nic', defaultMessage: 'Attach NIC' }),
        auth: {
          authKey: 'attacth.eip',
          resource: 'eip',
          type: 'action'
        },
      },
      {
        key: 'detach.eip',
        name: intl.formatMessage({ id: 'unbind.nic', defaultMessage: 'Detach NIC' }),
        auth: {
          authKey: 'detach.eip',
          resource: 'eip',
          type: 'action'
        },
      },
      {
        key: 'owner.eip.change',
        name: intl.formatMessage({ id: 'change.owner', defaultMessage: 'Change Owner' }),
        auth: {
          authKey: 'owner.eip.change',
          resource: 'eip',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'eip',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'attacth.eip', 'detach.eip', 'owner.eip.change', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'attacth.eip', 'detach.eip', 'owner.eip.change', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.eip'],
        activeKeys: ['owner.eip.change', 'delete'],
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
        extraKeys: ['create.eip', 'delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('eip', intl).then(remoteConfig => {
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
