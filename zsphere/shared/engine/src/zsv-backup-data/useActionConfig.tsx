import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.backup' | 'overwrite.recovery' | 'create.vm' | 'sync.to.remote.backup.storage' | 'sync.to.local.backup.storage' | 'change.owner' | 'delete'

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
        key: 'create.backup',
        name: intl.formatMessage({ id: 'create.backup', defaultMessage: 'Create Backup' }),
        auth: {
          authKey: 'create.backup',
          resource: 'zsv.backup.data',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'overwrite.recovery',
        name: intl.formatMessage({ id: 'overwrite.recovery', defaultMessage: 'Restore' }),
        auth: {
          authKey: 'overwrite.recovery',
          resource: 'zsv.backup.data',
          type: 'action'
        },
      },
      {
        key: 'create.vm',
        name: intl.formatMessage({ id: 'create.vm', defaultMessage: 'New Virtual Machine' }),
        auth: {
          authKey: 'create.vm',
          resource: 'zsv.backup.data',
          type: 'action'
        },
      },
      {
        key: 'create.vm-divider',
        divider: true,
      },
      {
        key: 'sync.to.remote.backup.storage',
        name: intl.formatMessage({ id: 'sync.to.remote.backup.storage', defaultMessage: 'Sync to Remote Backup Storage' }),
        auth: {
          authKey: 'sync.to.remote.backup.storage',
          resource: 'zsv.backup.data',
          type: 'action'
        },
      },
      {
        key: 'sync.to.local.backup.storage',
        name: intl.formatMessage({ id: 'sync.to.local.backup.storage', defaultMessage: 'Sync to Local Backup Storage' }),
        auth: {
          authKey: 'sync.to.local.backup.storage',
          resource: 'zsv.backup.data',
          type: 'action'
        },
      },
      {
        key: 'change.owner',
        name: intl.formatMessage({ id: 'change.owner', defaultMessage: 'Change Owner' }),
        auth: {
          authKey: 'change.owner',
          resource: 'zsv.backup.data',
          type: 'action'
        },
      },
      {
        key: 'change.owner-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'zsv.backup.data',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.local/directory': {
        extraKeys: [],
        activeKeys: ['overwrite.recovery', 'create.vm', 'sync.to.remote.backup.storage', 'change.owner', 'delete'],
      },
      'main.local/header': {
        extraKeys: ['overwrite.recovery', 'create.vm'],
        activeKeys: ['sync.to.remote.backup.storage', 'change.owner', 'delete'],
      },
      'main.local/row': {
        extraKeys: [],
        activeKeys: ['overwrite.recovery', 'create.vm', 'sync.to.remote.backup.storage', 'change.owner', 'delete'],
      },
      'main.local/toolbar': {
        extraKeys: ['create.backup'],
        activeKeys: ['sync.to.remote.backup.storage', 'change.owner', 'delete'],
      },
      'main.remote/directory': {
        extraKeys: [],
        activeKeys: ['sync.to.local.backup.storage', 'change.owner', 'delete'],
      },
      'main.remote/header': {
        extraKeys: ['sync.to.local.backup.storage'],
        activeKeys: ['change.owner', 'delete'],
      },
      'main.remote/row': {
        extraKeys: [],
        activeKeys: ['sync.to.local.backup.storage', 'change.owner', 'delete'],
      },
      'main.remote/toolbar': {
        extraKeys: ['create.backup'],
        activeKeys: ['sync.to.local.backup.storage', 'change.owner', 'delete'],
      },
      'sub.vm/header': {
        extraKeys: ['create.backup'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('zsv-backup-data', intl).then(remoteConfig => {
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
