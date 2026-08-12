import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'cover.revert' | 'recover' | 'scan' | 'export' | 'sync.db.to.remote' | 'sync.to.local.backupStorage' | 'sync.to.remote.backupStorage' | 'delete.db'

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
        key: 'cover.revert',
        name: intl.formatMessage({ id: 'cover.revert', defaultMessage: 'Restore' }),
        auth: {
          authKey: 'cover.revert',
          resource: 'local.backup.data.db',
          type: 'action'
        },
      },
      {
        key: 'recover',
        name: intl.formatMessage({ id: 'restore', defaultMessage: 'Restore' }),
        auth: {
          authKey: 'recover',
          resource: 'local.backup.data.db',
          type: 'action'
        },
      },
      {
        key: 'scan',
        name: intl.formatMessage({ id: 'scan.database.backup', defaultMessage: 'Scan Platform Database Backup' }),
        auth: {
          authKey: 'scan',
          resource: 'local.backup.data.db',
          type: 'action'
        },
        icon: 'restore',
      },
      {
        key: 'export',
        name: intl.formatMessage({ id: 'export', defaultMessage: 'Export ' }),
        auth: {
          authKey: 'export',
          resource: 'local.backup.data.db',
          type: 'action'
        },
      },
      {
        key: 'sync.db.to.remote',
        name: intl.formatMessage({ id: 'sync.to.remote', defaultMessage: 'Sync to Remote' }),
        auth: {
          authKey: 'sync.db.to.remote',
          resource: 'local.backup.data.db',
          type: 'action'
        },
      },
      {
        key: 'sync.to.local.backupStorage',
        name: intl.formatMessage({ id: 'sync.to.local.backupStorage', defaultMessage: 'Sync to Local Backup Storage' }),
        auth: {
          authKey: 'sync.to.local.backupStorage',
          resource: 'local.backup.data.db',
          type: 'action'
        },
      },
      {
        key: 'sync.to.remote.backupStorage',
        name: intl.formatMessage({ id: 'sync.to.remote.backupStorage', defaultMessage: 'Sync to Remote Backup Storage' }),
        auth: {
          authKey: 'sync.to.remote.backupStorage',
          resource: 'local.backup.data.db',
          type: 'action'
        },
      },
      {
        key: 'delete.db',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete.db',
          resource: 'local.backup.data.db',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main.local/row': {
        extraKeys: [],
        activeKeys: ['cover.revert', 'export', 'sync.to.remote.backupStorage', 'delete.db'],
      },
      'main.local/toolbar': {
        extraKeys: ['scan', 'delete.db'],
        activeKeys: [],
      },
      'main.managementNode/row': {
        extraKeys: [],
        activeKeys: ['cover.revert', 'delete.db'],
      },
      'main.managementNode/toolbar': {
        extraKeys: ['scan', 'delete.db'],
        activeKeys: [],
      },
      'main.remote/row': {
        extraKeys: [],
        activeKeys: ['cover.revert', 'export', 'sync.to.local.backupStorage', 'delete.db'],
      },
      'main.remote/toolbar': {
        extraKeys: ['scan', 'delete.db'],
        activeKeys: [],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['recover', 'scan', 'export', 'sync.db.to.remote', 'delete.db'],
      },
      'main/toolbar': {
        extraKeys: ['scan', 'delete.db'],
        activeKeys: [],
      },
      'sub.local/row': {
        extraKeys: [],
        activeKeys: ['recover', 'export', 'sync.db.to.remote', 'delete.db'],
      },
      'sub.local/toolbar': {
        extraKeys: ['scan', 'delete.db'],
        activeKeys: [],
      },
      'sub.remote/row': {
        extraKeys: [],
        activeKeys: ['recover', 'export', 'delete.db'],
      },
      'sub.remote/toolbar': {
        extraKeys: ['scan', 'delete.db'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('local-backup-data-db', intl).then(remoteConfig => {
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
