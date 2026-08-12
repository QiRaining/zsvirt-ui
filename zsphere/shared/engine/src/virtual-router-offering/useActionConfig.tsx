import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.virtual.router.offering' | 'edit' | 'start' | 'stop' | 'global.shared' | 'global.recall' | 'set.share.type' | 'delete' | 'cancel.share'

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
        key: 'create.virtual.router.offering',
        name: intl.formatMessage({ id: 'create.vrouterOffering', defaultMessage: 'Create vRouter Offering' }),
        auth: {
          authKey: 'create.virtual.router.offering',
          resource: 'virtual.router.offering',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'virtual.router.offering',
          type: 'action'
        },
      },
      {
        key: 'start',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'start',
          resource: 'virtual.router.offering',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'stop',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'stop',
          resource: 'virtual.router.offering',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'global.shared',
        name: intl.formatMessage({ id: 'globalShare', defaultMessage: 'Share globally' }),
        auth: {
          authKey: 'global.shared',
          resource: 'virtual.router.offering',
          type: 'action'
        },
      },
      {
        key: 'global.recall',
        name: intl.formatMessage({ id: 'globalRevoke', defaultMessage: 'Revoke Globally' }),
        auth: {
          authKey: 'global.recall',
          resource: 'virtual.router.offering',
          type: 'action'
        },
      },
      {
        key: 'set.share.type',
        name: intl.formatMessage({ id: 'set.shareMode', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'set.share.type',
          resource: 'virtual.router.offering',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'virtual.router.offering',
          type: 'action'
        },
      },
      {
        key: 'cancel.share',
        name: intl.formatMessage({ id: 'cancel.share', defaultMessage: 'Unshare' }),
        auth: {
          authKey: 'cancel.share',
          resource: 'virtual.router.offering',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['start', 'stop'],
        activeKeys: ['edit', 'set.share.type', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'start', 'stop', 'set.share.type', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.virtual.router.offering', 'start', 'stop'],
        activeKeys: ['set.share.type', 'delete'],
      },
      'sub.shared.resource/row': {
        extraKeys: ['cancel.share'],
        activeKeys: [],
      },
      'sub.shared.resource/toolbar': {
        extraKeys: ['cancel.share'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['edit', 'start', 'stop', 'set.share.type', 'delete'],
      },
      'sub/toolbar': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'set.share.type', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('virtual-router-offering', intl).then(remoteConfig => {
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
