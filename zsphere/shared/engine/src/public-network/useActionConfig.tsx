import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.network' | 'create.public.network' | 'edit' | 'add.ipv4.range' | 'add.ipv6.range' | 'add.dns' | 'set.share.mode' | 'set.default.network' | 'attach.security.gourp.to.l3.network' | 'detach.security.gourp.to.l3.network' | 'delete' | 'cancel.share'

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
        key: 'create.network',
        name: intl.formatMessage({ id: 'create.network', defaultMessage: 'Create Network' }),
        auth: {
          authKey: 'create.network',
          resource: 'public.network',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'create.public.network',
        name: intl.formatMessage({ id: 'create.publicNetwork', defaultMessage: 'Create Public Network' }),
        auth: {
          authKey: 'create.public.network',
          resource: 'public.network',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'public.network',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'add.ipv4.range',
        name: intl.formatMessage({ id: 'add.Ipv4NetworkRange', defaultMessage: 'Add IPv4 Range' }),
        auth: {
          authKey: 'add.ipv4.range',
          resource: 'public.network',
          type: 'action'
        },
      },
      {
        key: 'add.ipv6.range',
        name: intl.formatMessage({ id: 'add.Ipv6NetworkRange', defaultMessage: 'Add Pv6 Range' }),
        auth: {
          authKey: 'add.ipv6.range',
          resource: 'public.network',
          type: 'action'
        },
      },
      {
        key: 'add.dns',
        name: intl.formatMessage({ id: 'add.dns', defaultMessage: 'Add DNS' }),
        auth: {
          authKey: 'add.dns',
          resource: 'public.network',
          type: 'action'
        },
      },
      {
        key: 'set.share.mode',
        name: intl.formatMessage({ id: 'set.shareMode', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'set.share.mode',
          resource: 'public.network',
          type: 'action'
        },
      },
      {
        key: 'set.default.network',
        name: intl.formatMessage({ id: 'set.defaultNetwork', defaultMessage: 'Set as Default Network' }),
        auth: {
          authKey: 'set.default.network',
          resource: 'public.network',
          type: 'action'
        },
      },
      {
        key: 'attach.security.gourp.to.l3.network',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.security.gourp.to.l3.network',
          resource: 'public.network',
          type: 'action'
        },
      },
      {
        key: 'detach.security.gourp.to.l3.network',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.security.gourp.to.l3.network',
          resource: 'public.network',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'public.network',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'cancel.share',
        name: intl.formatMessage({ id: 'cancel.share', defaultMessage: 'Unshare' }),
        auth: {
          authKey: 'cancel.share',
          resource: 'public.network',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.public.share/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'main.public.share/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'main.public.share/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'main.public/header': {
        extraKeys: [],
        activeKeys: ['edit', 'add.ipv4.range', 'add.ipv6.range', 'add.dns', 'set.share.mode', 'delete'],
      },
      'main.public/row': {
        extraKeys: [],
        activeKeys: ['edit', 'add.ipv4.range', 'add.ipv6.range', 'add.dns', 'set.share.mode', 'delete'],
      },
      'main.public/toolbar': {
        extraKeys: ['create.public.network'],
        activeKeys: ['set.share.mode', 'delete'],
      },
      'sub.l2-network/row': {
        extraKeys: [],
        activeKeys: ['add.ipv4.range', 'add.ipv6.range', 'add.dns', 'set.share.mode', 'delete'],
      },
      'sub.l2-network/toolbar': {
        extraKeys: [],
        activeKeys: ['set.share.mode', 'delete'],
      },
      'sub.public.shared-resource/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.public.shared-resource/toolbar': {
        extraKeys: [],
        activeKeys: ['set.share.mode'],
      },
      'sub.public/row': {
        extraKeys: ['set.default.network'],
        activeKeys: [],
      },
      'sub.public/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.security-group/row': {
        extraKeys: [],
        activeKeys: ['detach.security.gourp.to.l3.network'],
      },
      'sub.security-group/toolbar': {
        extraKeys: ['attach.security.gourp.to.l3.network', 'detach.security.gourp.to.l3.network'],
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
      genActionFromRemote('public-network', intl).then(remoteConfig => {
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
