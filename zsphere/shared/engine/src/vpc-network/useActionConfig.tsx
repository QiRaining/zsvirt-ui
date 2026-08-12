import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.vpc.network' | 'edit' | 'add.ipv4.range' | 'add.ipv6.range' | 'add.dns' | 'set.share.mode' | 'attach.vpc.router' | 'detach.vpc.router' | 'set.default.network' | 'attach.security.gourp.to.l3.network' | 'detach.security.gourp.to.l3.network' | 'delete' | 'cancel.share'

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
        key: 'create.vpc.network',
        name: intl.formatMessage({ id: 'create.vpcNetwork', defaultMessage: 'Create VPC Network' }),
        auth: {
          authKey: 'create.vpc.network',
          resource: 'vpc.network',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'vpc.network',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'add.ipv4.range',
        name: intl.formatMessage({ id: 'add.Ipv4NetworkRange', defaultMessage: 'Add IPv4 Range' }),
        auth: {
          authKey: 'add.ipv4.range',
          resource: 'vpc.network',
          type: 'action'
        },
      },
      {
        key: 'add.ipv6.range',
        name: intl.formatMessage({ id: 'add.Ipv6NetworkRange', defaultMessage: 'Add Pv6 Range' }),
        auth: {
          authKey: 'add.ipv6.range',
          resource: 'vpc.network',
          type: 'action'
        },
      },
      {
        key: 'add.dns',
        name: intl.formatMessage({ id: 'add.dns', defaultMessage: 'Add DNS' }),
        auth: {
          authKey: 'add.dns',
          resource: 'vpc.network',
          type: 'action'
        },
      },
      {
        key: 'set.share.mode',
        name: intl.formatMessage({ id: 'set.shareMode', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'set.share.mode',
          resource: 'vpc.network',
          type: 'action'
        },
      },
      {
        key: 'set.share.mode-divider',
        divider: true,
      },
      {
        key: 'attach.vpc.router',
        name: intl.formatMessage({ id: 'attach.vpcRouter', defaultMessage: 'Attach VPC vRouter' }),
        auth: {
          authKey: 'attach.vpc.router',
          resource: 'vpc.network',
          type: 'action'
        },
      },
      {
        key: 'detach.vpc.router',
        name: intl.formatMessage({ id: 'detach.vpcRouter', defaultMessage: 'Detach VPC vRouter' }),
        auth: {
          authKey: 'detach.vpc.router',
          resource: 'vpc.network',
          type: 'action'
        },
      },
      {
        key: 'detach.vpc.router-divider',
        divider: true,
      },
      {
        key: 'set.default.network',
        name: intl.formatMessage({ id: 'set.defaultNetwork', defaultMessage: 'Set as Default Network' }),
        auth: {
          authKey: 'set.default.network',
          resource: 'vpc.network',
          type: 'action'
        },
      },
      {
        key: 'attach.security.gourp.to.l3.network',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.security.gourp.to.l3.network',
          resource: 'vpc.network',
          type: 'action'
        },
      },
      {
        key: 'detach.security.gourp.to.l3.network',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.security.gourp.to.l3.network',
          resource: 'vpc.network',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'vpc.network',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'cancel.share',
        name: intl.formatMessage({ id: 'cancel.share', defaultMessage: 'Unshare' }),
        auth: {
          authKey: 'cancel.share',
          resource: 'vpc.network',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.vpc.share/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'main.vpc.share/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'main.vpc.share/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'main.vpc/header': {
        extraKeys: [],
        activeKeys: ['edit', 'add.ipv4.range', 'add.ipv6.range', 'set.share.mode', 'attach.vpc.router', 'detach.vpc.router', 'delete'],
      },
      'main.vpc/row': {
        extraKeys: [],
        activeKeys: ['edit', 'add.ipv4.range', 'add.ipv6.range', 'set.share.mode', 'attach.vpc.router', 'detach.vpc.router', 'delete'],
      },
      'main.vpc/toolbar': {
        extraKeys: ['create.vpc.network'],
        activeKeys: ['set.share.mode', 'delete'],
      },
      'sub.l2-network.vpc/row': {
        extraKeys: [],
        activeKeys: ['add.dns', 'set.share.mode', 'delete'],
      },
      'sub.l2-network.vpc/toolbar': {
        extraKeys: [],
        activeKeys: ['add.dns', 'set.share.mode', 'delete'],
      },
      'sub.l2-network/row': {
        extraKeys: [],
        activeKeys: ['add.ipv4.range', 'add.ipv6.range', 'add.dns', 'set.share.mode', 'delete'],
      },
      'sub.l2-network/toolbar': {
        extraKeys: [],
        activeKeys: ['set.share.mode', 'delete'],
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
      'sub.vpc.shared-resource/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.vpc.shared-resource/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.vpc/row': {
        extraKeys: ['delete'],
        activeKeys: [],
      },
      'sub.vpc/toolbar': {
        extraKeys: ['create.vpc.network'],
        activeKeys: ['delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('vpc-network', intl).then(remoteConfig => {
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
