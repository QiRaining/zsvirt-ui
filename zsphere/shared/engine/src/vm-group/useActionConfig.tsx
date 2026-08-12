import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.vm.group' | 'edit' | 'add.vm' | 'remove.vm' | 'delete'

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
        key: 'create.vm.group',
        name: intl.formatMessage({ id: 'create.vmGroup', defaultMessage: 'New VM Scheduling Group' }),
        auth: {
          authKey: 'create.vm.group',
          resource: 'vm.group',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'vm.group',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'add.vm',
        name: intl.formatMessage({ id: 'add.vm', defaultMessage: 'Add Virtual Machine' }),
        auth: {
          authKey: 'add.vm',
          resource: 'vm.group',
          type: 'action'
        },
      },
      {
        key: 'remove.vm',
        name: intl.formatMessage({ id: 'remove.vm', defaultMessage: 'Remove Virtual Machine' }),
        auth: {
          authKey: 'remove.vm',
          resource: 'vm.group',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'vm.group',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'add.vm', 'remove.vm', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'add.vm', 'remove.vm', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.vm.group', 'delete'],
        activeKeys: [],
      },
      'virtualization.main/header': {
        extraKeys: ['edit'],
        activeKeys: ['add.vm', 'remove.vm', 'delete'],
      },
      'virtualization.main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'add.vm', 'remove.vm', 'delete'],
      },
      'virtualization.main/toolbar': {
        extraKeys: ['create.vm.group', 'delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('vm-group', intl).then(remoteConfig => {
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
