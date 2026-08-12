import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'enable' | 'disable' | 'reconnet' | 'scan.backup.data' | 'data.clear' | 'edit.name.and.desc' | 'modify.config' | 'update.password' | 'create.backup.storage' | 'delete'

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
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'zsv.backup.storage',
          type: 'action'
        },
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'zsv.backup.storage',
          type: 'action'
        },
      },
      {
        key: 'reconnet',
        name: intl.formatMessage({ id: 'reconnet', defaultMessage: 'Reconnect' }),
        auth: {
          authKey: 'reconnet',
          resource: 'zsv.backup.storage',
          type: 'action'
        },
      },
      {
        key: 'reconnet-divider',
        divider: true,
      },
      {
        key: 'scan.backup.data',
        name: intl.formatMessage({ id: 'scan.backup.data', defaultMessage: 'Scan Backup Data' }),
        auth: {
          authKey: 'scan.backup.data',
          resource: 'zsv.backup.storage',
          type: 'action'
        },
      },
      {
        key: 'data.clear',
        name: intl.formatMessage({ id: 'data.clear', defaultMessage: 'Cleanup Data' }),
        auth: {
          authKey: 'data.clear',
          resource: 'zsv.backup.storage',
          type: 'action'
        },
      },
      {
        key: 'edit.name.and.desc',
        name: intl.formatMessage({ id: 'edit.name.and.desc', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'edit.name.and.desc',
          resource: 'zsv.backup.storage',
          type: 'action'
        },
      },
      {
        key: 'modify.config',
        name: intl.formatMessage({ id: 'modify.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'modify.config',
          resource: 'zsv.backup.storage',
          type: 'action'
        },
      },
      {
        key: 'update.password',
        name: intl.formatMessage({ id: 'update.password', defaultMessage: 'Update Password' }),
        auth: {
          authKey: 'update.password',
          resource: 'zsv.backup.storage',
          type: 'action'
        },
      },
      {
        key: 'update.password-divider',
        divider: true,
      },
      {
        key: 'create.backup.storage',
        name: intl.formatMessage({ id: 'create.backup.storage', defaultMessage: 'Add Backup Storage' }),
        auth: {
          authKey: 'create.backup.storage',
          resource: 'zsv.backup.storage',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'zsv.backup.storage',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'reconnet', 'scan.backup.data', 'data.clear', 'edit.name.and.desc', 'modify.config', 'update.password', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'reconnet', 'scan.backup.data', 'data.clear', 'edit.name.and.desc', 'modify.config', 'update.password', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.backup.storage'],
        activeKeys: ['enable', 'disable', 'reconnet', 'data.clear', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('zsv-backup-storage', intl).then(remoteConfig => {
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
