import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'add.virtual.router.image' | 'edit' | 'enable' | 'disable' | 'export.virtual.router.image' | 'delete' | 'recover' | 'expunge' | 'download' | 'copy.url' | 'delete.exported'

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
        key: 'add.virtual.router.image',
        name: intl.formatMessage({ id: 'add.virtualRouterImage', defaultMessage: 'Add vRouter Image' }),
        auth: {
          authKey: 'add.virtual.router.image',
          resource: 'virtual.router.image',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'virtual.router.image',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'virtual.router.image',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'virtual.router.image',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'export.virtual.router.image',
        name: intl.formatMessage({ id: 'export.virtualRouterImage', defaultMessage: 'Export VPC vRouter Image' }),
        auth: {
          authKey: 'export.virtual.router.image',
          resource: 'virtual.router.image',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'virtual.router.image',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'recover',
        name: intl.formatMessage({ id: 'recover', defaultMessage: 'Recover' }),
        auth: {
          authKey: 'recover',
          resource: 'virtual.router.image',
          type: 'action'
        },
        icon: 'undo',
      },
      {
        key: 'expunge',
        name: intl.formatMessage({ id: 'expunge', defaultMessage: 'Expunge' }),
        auth: {
          authKey: 'expunge',
          resource: 'virtual.router.image',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'download',
        name: intl.formatMessage({ id: 'download', defaultMessage: 'Download' }),
        auth: {
          authKey: 'download',
          resource: 'virtual.router.image',
          type: 'action'
        },
        icon: 'download',
      },
      {
        key: 'copy.url',
        name: intl.formatMessage({ id: 'copy.url', defaultMessage: 'Copy URL' }),
        auth: {
          authKey: 'copy.url',
          resource: 'virtual.router.image',
          type: 'action'
        },
      },
      {
        key: 'delete.exported',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete.exported',
          resource: 'virtual.router.image',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main.backup.storage': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['export.virtual.router.image', 'delete'],
      },
      'main.exported/header': {
        extraKeys: ['download', 'delete.exported'],
        activeKeys: [],
      },
      'main.exported/row': {
        extraKeys: [],
        activeKeys: ['download', 'copy.url', 'delete.exported'],
      },
      'main.exported/toolbar': {
        extraKeys: ['delete.exported'],
        activeKeys: [],
      },
      'main/header': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['edit', 'export.virtual.router.image', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'export.virtual.router.image', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['add.virtual.router.image', 'enable', 'disable', 'delete'],
        activeKeys: [],
      },
      'recycle/header': {
        extraKeys: ['recover', 'expunge'],
        activeKeys: [],
      },
      'recycle/row': {
        extraKeys: [],
        activeKeys: ['recover', 'expunge'],
      },
      'recycle/toolbar': {
        extraKeys: ['recover', 'expunge'],
        activeKeys: [],
      },
      'sub.backup.storage/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'export.virtual.router.image', 'delete'],
      },
      'sub.backup.storage/toolbar': {
        extraKeys: ['add.virtual.router.image'],
        activeKeys: ['enable', 'disable', 'delete'],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'export.virtual.router.image', 'delete'],
      },
      'sub/toolbar': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'export.virtual.router.image', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('virtual-router-image', intl).then(remoteConfig => {
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
