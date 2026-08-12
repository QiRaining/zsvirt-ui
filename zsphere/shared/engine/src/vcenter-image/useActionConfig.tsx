import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'add.image' | 'edit' | 'enable' | 'disable' | 'set.share.type' | 'change.owner' | 'delete' | 'recover' | 'expunge' | 'cancel.share'

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
          resource: 'vcenter.image',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'vcenter.image',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'vcenter.image',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'vcenter.image',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'set.share.type',
        name: intl.formatMessage({ id: 'set.shareMode', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'set.share.type',
          resource: 'vcenter.image',
          type: 'action'
        },
      },
      {
        key: 'change.owner',
        name: intl.formatMessage({ id: 'change.owner', defaultMessage: 'Change Owner' }),
        auth: {
          authKey: 'change.owner',
          resource: 'vcenter.image',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'vcenter.image',
          type: 'action'
        },
      },
      {
        key: 'recover',
        name: intl.formatMessage({ id: 'recover', defaultMessage: 'Recover' }),
        auth: {
          authKey: 'recover',
          resource: 'vcenter.image',
          type: 'action'
        },
        icon: 'undo',
      },
      {
        key: 'expunge',
        name: intl.formatMessage({ id: 'expunge', defaultMessage: 'Expunge' }),
        auth: {
          authKey: 'expunge',
          resource: 'vcenter.image',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'cancel.share',
        name: intl.formatMessage({ id: 'cancel.share', defaultMessage: 'Unshare' }),
        auth: {
          authKey: 'cancel.share',
          resource: 'vcenter.image',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.mine/header': {
        extraKeys: ['enable', 'disable', 'delete'],
        activeKeys: ['edit'],
      },
      'main.mine/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'delete'],
      },
      'main.mine/toolbar': {
        extraKeys: ['add.image', 'enable', 'disable', 'delete'],
        activeKeys: [],
      },
      'main.shared/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'main.shared/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'main.shared/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/header': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['edit', 'set.share.type', 'change.owner', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'set.share.type', 'change.owner', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['add.image', 'enable', 'disable'],
        activeKeys: ['set.share.type', 'change.owner', 'delete'],
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
      'sub.shared.resource/row': {
        extraKeys: ['cancel.share'],
        activeKeys: [],
      },
      'sub.shared.resource/toolbar': {
        extraKeys: ['cancel.share'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('vcenter-image', intl).then(remoteConfig => {
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
