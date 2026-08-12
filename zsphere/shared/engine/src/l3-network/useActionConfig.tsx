import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.network' | 'edit' | 'create.vpc.network' | 'add.ipv4.range' | 'add.ipv6.range' | 'add.ip.range' | 'add.dns' | 'set.share.mode' | 'attach.vpc.router' | 'detach.vpc.router' | 'set.default.network' | 'attach.security.gourp.to.l3.network' | 'detach.security.gourp.to.l3.network' | 'attach.alarm' | 'detach.alarm' | 'delete'

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
          resource: 'l3.network',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'l3.network',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'create.vpc.network',
        name: intl.formatMessage({ id: 'create.vpcNetwork', defaultMessage: 'Create VPC Network' }),
        auth: {
          authKey: 'create.vpc.network',
          resource: 'l3.network',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'add.ipv4.range',
        name: intl.formatMessage({ id: 'add.Ipv4NetworkRange', defaultMessage: 'Add IPv4 Range' }),
        auth: {
          authKey: 'add.ipv4.range',
          resource: 'l3.network',
          type: 'action'
        },
      },
      {
        key: 'add.ipv6.range',
        name: intl.formatMessage({ id: 'add.Ipv6NetworkRange', defaultMessage: 'Add Pv6 Range' }),
        auth: {
          authKey: 'add.ipv6.range',
          resource: 'l3.network',
          type: 'action'
        },
      },
      {
        key: 'add.ip.range',
        name: intl.formatMessage({ id: 'add.networkRange', defaultMessage: 'Add Network Range' }),
        auth: {
          authKey: 'add.ip.range',
          resource: 'l3.network',
          type: 'action'
        },
      },
      {
        key: 'add.dns',
        name: intl.formatMessage({ id: 'add.dns', defaultMessage: 'Add DNS' }),
        auth: {
          authKey: 'add.dns',
          resource: 'l3.network',
          type: 'action'
        },
      },
      {
        key: 'set.share.mode',
        name: intl.formatMessage({ id: 'set.shareMode', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'set.share.mode',
          resource: 'l3.network',
          type: 'action'
        },
      },
      {
        key: 'attach.vpc.router',
        name: intl.formatMessage({ id: 'attach.vpcRouter', defaultMessage: 'Attach VPC vRouter' }),
        auth: {
          authKey: 'attach.vpc.router',
          resource: 'l3.network',
          type: 'action'
        },
      },
      {
        key: 'detach.vpc.router',
        name: intl.formatMessage({ id: 'detach.vpcRouter', defaultMessage: 'Detach VPC vRouter' }),
        auth: {
          authKey: 'detach.vpc.router',
          resource: 'l3.network',
          type: 'action'
        },
      },
      {
        key: 'set.default.network',
        name: intl.formatMessage({ id: 'set.defaultNetwork', defaultMessage: 'Set as Default Network' }),
        auth: {
          authKey: 'set.default.network',
          resource: 'l3.network',
          type: 'action'
        },
      },
      {
        key: 'attach.security.gourp.to.l3.network',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.security.gourp.to.l3.network',
          resource: 'l3.network',
          type: 'action'
        },
      },
      {
        key: 'detach.security.gourp.to.l3.network',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.security.gourp.to.l3.network',
          resource: 'l3.network',
          type: 'action'
        },
      },
      {
        key: 'attach.alarm',
        name: intl.formatMessage({ id: 'add', defaultMessage: 'Add' }),
        auth: {
          authKey: 'attach.alarm',
          resource: 'l3.network',
          type: 'action'
        },
      },
      {
        key: 'detach.alarm',
        name: intl.formatMessage({ id: 'remove', defaultMessage: 'Remove' }),
        auth: {
          authKey: 'detach.alarm',
          resource: 'l3.network',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'l3.network',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main.vcenter/header': {
        extraKeys: [],
        activeKeys: ['add.ip.range', 'add.dns', 'set.share.mode', 'delete'],
      },
      'main.vcenter/row': {
        extraKeys: [],
        activeKeys: ['add.ip.range', 'add.dns', 'set.share.mode', 'delete'],
      },
      'main.vcenter/toolbar': {
        extraKeys: ['create.network'],
        activeKeys: ['set.share.mode', 'delete'],
      },
      'sub.alarm/row': {
        extraKeys: [],
        activeKeys: ['detach.alarm'],
      },
      'sub.alarm/toolbar': {
        extraKeys: ['attach.alarm', 'detach.alarm'],
        activeKeys: [],
      },
      'sub.flat.shared-resource/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.flat.shared-resource/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.flat/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.flat/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.flow/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.flow/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.l2-network/row': {
        extraKeys: [],
        activeKeys: ['add.ipv4.range', 'add.ipv6.range', 'add.dns', 'set.share.mode', 'delete'],
      },
      'sub.l2-network/toolbar': {
        extraKeys: [],
        activeKeys: ['set.share.mode', 'delete'],
      },
      'sub.manage/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.manage/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.public.shared-resource/row': {
        extraKeys: [],
        activeKeys: ['set.share.mode'],
      },
      'sub.public.shared-resource/toolbar': {
        extraKeys: [],
        activeKeys: ['set.share.mode'],
      },
      'sub.public/row': {
        extraKeys: [],
        activeKeys: ['set.default.network', 'attach.security.gourp.to.l3.network', 'detach.security.gourp.to.l3.network'],
      },
      'sub.public/toolbar': {
        extraKeys: [],
        activeKeys: ['attach.security.gourp.to.l3.network', 'detach.security.gourp.to.l3.network'],
      },
      'sub.security-group/row': {
        extraKeys: [],
        activeKeys: ['detach.security.gourp.to.l3.network'],
      },
      'sub.security-group/toolbar': {
        extraKeys: ['attach.security.gourp.to.l3.network', 'detach.security.gourp.to.l3.network'],
        activeKeys: [],
      },
      'sub.virtualization.alarm/row': {
        extraKeys: [],
        activeKeys: ['detach.alarm'],
      },
      'sub.virtualization.alarm/toolbar': {
        extraKeys: ['attach.alarm', 'detach.alarm'],
        activeKeys: [],
      },
      'sub.virtualization.l2-network/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.l2-network/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.zone/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.zone/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.vpc.shared-resource/row': {
        extraKeys: [],
        activeKeys: ['set.share.mode'],
      },
      'sub.vpc.shared-resource/toolbar': {
        extraKeys: [],
        activeKeys: ['set.share.mode'],
      },
      'sub.vpc/row': {
        extraKeys: [],
        activeKeys: ['delete'],
      },
      'sub.vpc/toolbar': {
        extraKeys: [],
        activeKeys: ['attach.security.gourp.to.l3.network', 'detach.security.gourp.to.l3.network', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('l3-network', intl).then(remoteConfig => {
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
