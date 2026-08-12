import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'add.ip.range' | 'set.share' | 'delete' | 'virtualization.add.ipRange' | 'virtualization.delete'

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
        key: 'add.ip.range',
        name: intl.formatMessage({ id: 'add.networkRange', defaultMessage: 'Add Network Range' }),
        auth: {
          authKey: 'add.ip.range',
          resource: 'ip.range',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'set.share',
        name: intl.formatMessage({ id: 'set.shareMode', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'set.share',
          resource: 'ip.range',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'ip.range',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'virtualization.add.ipRange',
        name: intl.formatMessage({ id: 'add.ipRange', defaultMessage: 'Add Network Range' }),
        auth: {
          authKey: 'virtualization.add.ipRange',
          resource: 'ip.range',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'virtualization.delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'virtualization.delete',
          resource: 'ip.range',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'sub.ipv4/row': {
        extraKeys: [],
        activeKeys: ['set.share', 'delete'],
      },
      'sub.ipv4/toolbar': {
        extraKeys: ['add.ip.range'],
        activeKeys: ['set.share', 'delete'],
      },
      'sub.ipv6/row': {
        extraKeys: [],
        activeKeys: ['set.share', 'delete'],
      },
      'sub.ipv6/toolbar': {
        extraKeys: ['add.ip.range'],
        activeKeys: ['set.share', 'delete'],
      },
      'sub.public.ipv4/row': {
        extraKeys: [],
        activeKeys: ['set.share', 'delete'],
      },
      'sub.public.ipv4/toolbar': {
        extraKeys: ['add.ip.range'],
        activeKeys: ['set.share', 'delete'],
      },
      'sub.public.ipv6/row': {
        extraKeys: [],
        activeKeys: ['set.share', 'delete'],
      },
      'sub.public.ipv6/toolbar': {
        extraKeys: ['add.ip.range'],
        activeKeys: ['set.share', 'delete'],
      },
      'sub.share.ipv4/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.share.ipv4/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.share.public.ipv6/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.share.public.ipv6/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'virtualization.sub.l3network.ipv6/row': {
        extraKeys: [],
        activeKeys: ['virtualization.delete'],
      },
      'virtualization.sub.l3network.ipv6/toolbar': {
        extraKeys: ['virtualization.add.ipRange', 'virtualization.delete'],
        activeKeys: [],
      },
      'virtualization.sub.l3network/row': {
        extraKeys: [],
        activeKeys: ['virtualization.delete'],
      },
      'virtualization.sub.l3network/toolbar': {
        extraKeys: ['virtualization.add.ipRange', 'virtualization.delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('ip-range', intl).then(remoteConfig => {
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
