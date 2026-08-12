import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create' | 'enable' | 'disable' | 'triggerNow' | 'editNameDesc' | 'editBasicConfig' | 'editBackupPolicy' | 'delete'

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
        key: 'create',
        name: intl.formatMessage({ id: 'create.backup.policy', defaultMessage: 'New Backup Plan' }),
        auth: {
          authKey: 'create',
          resource: 'backup.job',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'backup.job',
          type: 'action'
        },
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'backup.job',
          type: 'action'
        },
      },
      {
        key: 'disable-divider',
        divider: true,
      },
      {
        key: 'triggerNow',
        name: intl.formatMessage({ id: 'backup.now', defaultMessage: 'Backup Now' }),
        auth: {
          authKey: 'triggerNow',
          resource: 'backup.job',
          type: 'action'
        },
      },
      {
        key: 'editNameDesc',
        name: intl.formatMessage({ id: 'edit.name.and.desc', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'editNameDesc',
          resource: 'backup.job',
          type: 'action'
        },
      },
      {
        key: 'editBasicConfig',
        name: intl.formatMessage({ id: 'edit.basic.config', defaultMessage: 'Modify Basic Settings' }),
        auth: {
          authKey: 'editBasicConfig',
          resource: 'backup.job',
          type: 'action'
        },
      },
      {
        key: 'editBackupPolicy',
        name: intl.formatMessage({ id: 'edit.backup.policy', defaultMessage: 'Modify Backup Policy' }),
        auth: {
          authKey: 'editBackupPolicy',
          resource: 'backup.job',
          type: 'action'
        },
      },
      {
        key: 'editBackupPolicy-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'backup.job',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'triggerNow', 'editNameDesc', 'editBasicConfig', 'editBackupPolicy', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'triggerNow', 'editNameDesc', 'editBasicConfig', 'editBackupPolicy', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create'],
        activeKeys: ['enable', 'disable', 'delete'],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'delete'],
      },
      'sub/toolbar': {
        extraKeys: ['create'],
        activeKeys: ['enable', 'disable', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('backup-job', intl).then(remoteConfig => {
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
