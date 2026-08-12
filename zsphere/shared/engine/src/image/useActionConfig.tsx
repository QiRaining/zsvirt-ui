import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'add.image' | 'virtualization.create.vm' | 'export.image' | 'sync.image' | 'virtualization.edit.nameandDescription' | 'modify.config' | 'storage.migrate' | 'set.share.type' | 'share.resource' | 'cancel.share' | 'delete' | 'recover' | 'expunge' | 'download' | 'copy.url' | 'delete.exported'

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
        key: 'add.image',
        name: intl.formatMessage({ id: 'add.image', defaultMessage: 'Add Image' }),
        auth: {
          authKey: 'add.image',
          resource: 'image',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'virtualization.create.vm',
        name: intl.formatMessage({ id: 'virtualization.create.vm', defaultMessage: 'New Virtual Machine' }),
        auth: {
          authKey: 'virtualization.create.vm',
          resource: 'image',
          type: 'action'
        },
      },
      {
        key: 'export.image',
        name: intl.formatMessage({ id: 'export.image', defaultMessage: 'Export Image' }),
        auth: {
          authKey: 'export.image',
          resource: 'image',
          type: 'action'
        },
      },
      {
        key: 'sync.image',
        name: intl.formatMessage({ id: 'sync.image', defaultMessage: 'Synchronize Image' }),
        auth: {
          authKey: 'sync.image',
          resource: 'image',
          type: 'action'
        },
      },
      {
        key: 'sync.image-divider',
        divider: true,
      },
      {
        key: 'virtualization.edit.nameandDescription',
        name: intl.formatMessage({ id: 'virtualization.edit.nameandDescription', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'virtualization.edit.nameandDescription',
          resource: 'image',
          type: 'action'
        },
      },
      {
        key: 'modify.config',
        name: intl.formatMessage({ id: 'modify.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'modify.config',
          resource: 'image',
          type: 'action'
        },
      },
      {
        key: 'storage.migrate',
        name: intl.formatMessage({ id: 'image.migrate.changeBackupStorage', defaultMessage: 'Change Image Storage' }),
        auth: {
          authKey: 'storage.migrate',
          resource: 'image',
          type: 'action'
        },
      },
      {
        key: 'set.share.type',
        name: intl.formatMessage({ id: 'set.shareMode', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'set.share.type',
          resource: 'image',
          type: 'action'
        },
      },
      {
        key: 'set.share.type-divider',
        divider: true,
      },
      {
        key: 'share.resource',
        name: intl.formatMessage({ id: 'share.resource', defaultMessage: 'Share Resource' }),
        auth: {
          authKey: 'share.resource',
          resource: 'image',
          type: 'action'
        },
      },
      {
        key: 'cancel.share',
        name: intl.formatMessage({ id: 'cancel.share', defaultMessage: 'Unshare' }),
        auth: {
          authKey: 'cancel.share',
          resource: 'image',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'image',
          type: 'action'
        },
      },
      {
        key: 'recover',
        name: intl.formatMessage({ id: 'recover', defaultMessage: 'Recover' }),
        auth: {
          authKey: 'recover',
          resource: 'image',
          type: 'action'
        },
        icon: 'undo',
      },
      {
        key: 'expunge',
        name: intl.formatMessage({ id: 'expunge', defaultMessage: 'Expunge' }),
        auth: {
          authKey: 'expunge',
          resource: 'image',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'download',
        name: intl.formatMessage({ id: 'download', defaultMessage: 'Download' }),
        auth: {
          authKey: 'download',
          resource: 'image',
          type: 'action'
        },
      },
      {
        key: 'copy.url',
        name: intl.formatMessage({ id: 'copy.url', defaultMessage: 'Copy URL' }),
        auth: {
          authKey: 'copy.url',
          resource: 'image',
          type: 'action'
        },
      },
      {
        key: 'delete.exported',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete.exported',
          resource: 'image',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['export.image', 'sync.image', 'storage.migrate', 'set.share.type', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['export.image', 'sync.image', 'storage.migrate', 'set.share.type', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['add.image'],
        activeKeys: ['export.image', 'sync.image', 'set.share.type', 'delete'],
      },
      'sub.virtualization.account.shared/row': {
        extraKeys: [],
        activeKeys: ['virtualization.create.vm'],
      },
      'sub.virtualization.account.shared/toolbar': {
        extraKeys: ['delete'],
        activeKeys: ['add.image'],
      },
      'sub.virtualization.backup-storage.detail.exported/row': {
        extraKeys: [],
        activeKeys: ['download', 'copy.url', 'delete.exported'],
      },
      'sub.virtualization.backup-storage.detail.exported/toolbar': {
        extraKeys: ['delete.exported'],
        activeKeys: [],
      },
      'sub.virtualization.backup-storage/row': {
        extraKeys: [],
        activeKeys: ['virtualization.create.vm', 'export.image', 'sync.image', 'virtualization.edit.nameandDescription', 'modify.config', 'storage.migrate', 'set.share.type', 'delete'],
      },
      'sub.virtualization.backup-storage/toolbar': {
        extraKeys: ['add.image'],
        activeKeys: ['sync.image', 'set.share.type', 'delete'],
      },
      'sub.virtualization.zone.detail.exported/row': {
        extraKeys: [],
        activeKeys: ['download', 'copy.url', 'delete.exported'],
      },
      'sub.virtualization.zone.detail.exported/toolbar': {
        extraKeys: ['delete.exported'],
        activeKeys: [],
      },
      'sub.virtualization.zone.recyle/row': {
        extraKeys: [],
        activeKeys: ['recover', 'expunge'],
      },
      'sub.virtualization.zone.recyle/toolbar': {
        extraKeys: ['recover', 'expunge'],
        activeKeys: [],
      },
      'sub.zsv.shared.resource/row': {
        extraKeys: [],
        activeKeys: ['virtualization.create.vm', 'export.image', 'sync.image', 'virtualization.edit.nameandDescription', 'modify.config', 'set.share.type', 'cancel.share', 'delete'],
      },
      'sub.zsv.shared.resource/toolbar': {
        extraKeys: ['share.resource', 'cancel.share'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['export.image', 'sync.image', 'storage.migrate', 'set.share.type', 'delete'],
      },
      'sub/toolbar': {
        extraKeys: ['add.image'],
        activeKeys: ['sync.image', 'set.share.type', 'delete'],
      },
      'virtualization.account.shared.dir.template.image/directory': {
        extraKeys: [],
        activeKeys: ['virtualization.create.vm'],
      },
      'virtualization.account.shared.dir.template.image/header': {
        extraKeys: [],
        activeKeys: ['virtualization.create.vm'],
      },
      'virtualization.dir.template.image/directory': {
        extraKeys: [],
        activeKeys: ['virtualization.create.vm', 'export.image', 'sync.image', 'virtualization.edit.nameandDescription', 'modify.config', 'storage.migrate', 'set.share.type', 'delete'],
      },
      'virtualization.template.image.main/header': {
        extraKeys: [],
        activeKeys: ['virtualization.create.vm', 'export.image', 'sync.image', 'virtualization.edit.nameandDescription', 'modify.config', 'storage.migrate', 'set.share.type', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('image', intl).then(remoteConfig => {
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
