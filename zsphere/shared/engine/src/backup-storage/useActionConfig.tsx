import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'add.backup.storage' | 'add.image' | 'enable' | 'disable' | 'reconnect' | 'virtualization.edit.nameandDescription' | 'modify.config' | 'modify.advance.settings' | 'data.clean' | 'update.password' | 'delete' | 'attach.alarm' | 'detach.alarm'

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
        key: 'add.backup.storage',
        name: intl.formatMessage({ id: 'add.backupStorage', defaultMessage: 'Add Image Storage' }),
        auth: {
          authKey: 'add.backup.storage',
          resource: 'backup.storage',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'add.image',
        name: intl.formatMessage({ id: 'add.image', defaultMessage: 'Add Image' }),
        auth: {
          authKey: 'add.image',
          resource: 'backup.storage',
          type: 'action'
        },
      },
      {
        key: 'add.image-divider',
        divider: true,
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'backup.storage',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'backup.storage',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'reconnect',
        name: intl.formatMessage({ id: 'reconnect', defaultMessage: 'Reconnect' }),
        auth: {
          authKey: 'reconnect',
          resource: 'backup.storage',
          type: 'action'
        },
      },
      {
        key: 'reconnect-divider',
        divider: true,
      },
      {
        key: 'virtualization.edit.nameandDescription',
        name: intl.formatMessage({ id: 'virtualization.edit.nameandDescription', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'virtualization.edit.nameandDescription',
          resource: 'backup.storage',
          type: 'action'
        },
      },
      {
        key: 'modify.config',
        name: intl.formatMessage({ id: 'modify.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'modify.config',
          resource: 'backup.storage',
          type: 'action'
        },
      },
      {
        key: 'modify.advance.settings',
        name: intl.formatMessage({ id: 'modify.advance.settings', defaultMessage: 'Modify Advanced Settings' }),
        auth: {
          authKey: 'modify.advance.settings',
          resource: 'backup.storage',
          type: 'action'
        },
      },
      {
        key: 'data.clean',
        name: intl.formatMessage({ id: 'data.clean', defaultMessage: 'Cleanup Data' }),
        auth: {
          authKey: 'data.clean',
          resource: 'backup.storage',
          type: 'action'
        },
      },
      {
        key: 'update.password',
        name: intl.formatMessage({ id: 'update.password', defaultMessage: 'Update Password' }),
        auth: {
          authKey: 'update.password',
          resource: 'backup.storage',
          type: 'action'
        },
      },
      {
        key: 'update.password-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'backup.storage',
          type: 'action'
        },
      },
      {
        key: 'attach.alarm',
        name: intl.formatMessage({ id: 'add', defaultMessage: 'Add' }),
        auth: {
          authKey: 'attach.alarm',
          resource: 'backup.storage',
          type: 'action'
        },
      },
      {
        key: 'detach.alarm',
        name: intl.formatMessage({ id: 'remove', defaultMessage: 'Remove' }),
        auth: {
          authKey: 'detach.alarm',
          resource: 'backup.storage',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['reconnect', 'data.clean', 'update.password', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'reconnect', 'data.clean', 'update.password', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['add.backup.storage', 'enable', 'disable'],
        activeKeys: ['reconnect', 'data.clean', 'delete'],
      },
      'sub.alarm/row': {
        extraKeys: [],
        activeKeys: ['detach.alarm'],
      },
      'sub.alarm/toolbar': {
        extraKeys: ['attach.alarm', 'detach.alarm'],
        activeKeys: [],
      },
      'sub.virutalization.alarm/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'reconnect', 'virtualization.edit.nameandDescription', 'data.clean', 'update.password', 'delete'],
      },
      'sub.virutalization.alarm/toolbar': {
        extraKeys: ['add.backup.storage', 'enable', 'disable'],
        activeKeys: ['reconnect', 'data.clean', 'delete'],
      },
      'sub.virutalization.zone/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'reconnect', 'virtualization.edit.nameandDescription', 'data.clean', 'update.password', 'delete'],
      },
      'sub.virutalization.zone/toolbar': {
        extraKeys: ['add.backup.storage', 'enable', 'disable'],
        activeKeys: ['reconnect', 'data.clean', 'delete'],
      },
      'virtualization.dir.template.image/directory': {
        extraKeys: [],
        activeKeys: ['add.image', 'enable', 'disable', 'reconnect', 'virtualization.edit.nameandDescription', 'modify.config', 'modify.advance.settings', 'data.clean', 'update.password', 'delete'],
      },
      'virtualization.template.image.main/header': {
        extraKeys: [],
        activeKeys: ['add.image', 'enable', 'disable', 'reconnect', 'virtualization.edit.nameandDescription', 'modify.config', 'modify.advance.settings', 'data.clean', 'update.password', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('backup-storage', intl).then(remoteConfig => {
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
