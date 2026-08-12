import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.vxlanpool' | 'edit' | 'attach.vxlanpool' | 'detach.vxlanpool' | 'set.share.type' | 'delete' | 'cancel.share'

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
        key: 'create.vxlanpool',
        name: intl.formatMessage({ id: 'create.vxlanPool', defaultMessage: 'Create VXLAN Pool' }),
        auth: {
          authKey: 'create.vxlanpool',
          resource: 'vxlan.pool',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'vxlan.pool',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'attach.vxlanpool',
        name: intl.formatMessage({ id: 'attach.cluster', defaultMessage: 'Attach Cluster' }),
        auth: {
          authKey: 'attach.vxlanpool',
          resource: 'vxlan.pool',
          type: 'action'
        },
      },
      {
        key: 'detach.vxlanpool',
        name: intl.formatMessage({ id: 'detach.cluster', defaultMessage: 'Detach Cluster' }),
        auth: {
          authKey: 'detach.vxlanpool',
          resource: 'vxlan.pool',
          type: 'action'
        },
      },
      {
        key: 'set.share.type',
        name: intl.formatMessage({ id: 'set.share.type', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'set.share.type',
          resource: 'vxlan.pool',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'vxlan.pool',
          type: 'action'
        },
      },
      {
        key: 'cancel.share',
        name: intl.formatMessage({ id: 'cancel.share', defaultMessage: 'Unshare' }),
        auth: {
          authKey: 'cancel.share',
          resource: 'vxlan.pool',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'attach.vxlanpool', 'detach.vxlanpool', 'set.share.type', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'attach.vxlanpool', 'detach.vxlanpool', 'set.share.type', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.vxlanpool'],
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
        activeKeys: ['attach.vxlanpool', 'detach.vxlanpool'],
      },
      'sub/toolbar': {
        extraKeys: [],
        activeKeys: ['attach.vxlanpool', 'detach.vxlanpool'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('vxlan-pool', intl).then(remoteConfig => {
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
