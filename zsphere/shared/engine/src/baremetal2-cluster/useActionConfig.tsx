import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.elastic.baremetal.cluster' | 'edit' | 'enable' | 'disable' | 'attach.l2network' | 'detach.l2network' | 'attach.gateways' | 'detach.gateways' | 'change.prosivion.network' | 'attach.primary.storage' | 'detach.primary.storage' | 'delete' | 'attach.in.l2network' | 'detach.in.l2network' | 'attach.in.primary.storage' | 'detach.in.primary.storage' | 'attach.in.iscsi.server' | 'detach.in.iscsi.server' | 'attach.in.virtualization.iscsi.server' | 'detach.in.virtualization.iscsi.server'

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
        key: 'create.elastic.baremetal.cluster',
        name: intl.formatMessage({ id: 'create.elasticBaremetalCluster', defaultMessage: 'Create Elastic Baremetal Cluster' }),
        auth: {
          authKey: 'create.elastic.baremetal.cluster',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'disable-divider',
        divider: true,
      },
      {
        key: 'attach.l2network',
        name: intl.formatMessage({ id: 'attach.l2Network', defaultMessage: 'Attach Distributed Switch' }),
        auth: {
          authKey: 'attach.l2network',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
      },
      {
        key: 'detach.l2network',
        name: intl.formatMessage({ id: 'detach.l2Network', defaultMessage: 'Detach Distributed Switch' }),
        auth: {
          authKey: 'detach.l2network',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
      },
      {
        key: 'attach.gateways',
        name: intl.formatMessage({ id: 'attach.gateways', defaultMessage: 'Add Gateway Node' }),
        auth: {
          authKey: 'attach.gateways',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
      },
      {
        key: 'detach.gateways',
        name: intl.formatMessage({ id: 'detach.gateways', defaultMessage: 'Detach Gateway Node' }),
        auth: {
          authKey: 'detach.gateways',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
      },
      {
        key: 'change.prosivion.network',
        name: intl.formatMessage({ id: 'change.prosivionNetwork', defaultMessage: 'Change Provision Network' }),
        auth: {
          authKey: 'change.prosivion.network',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
      },
      {
        key: 'attach.primary.storage',
        name: intl.formatMessage({ id: 'attach.primaryStorage', defaultMessage: 'Attach Data Storage' }),
        auth: {
          authKey: 'attach.primary.storage',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
      },
      {
        key: 'detach.primary.storage',
        name: intl.formatMessage({ id: 'detach.primaryStorage', defaultMessage: 'Detach Data Storage' }),
        auth: {
          authKey: 'detach.primary.storage',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
      },
      {
        key: 'detach.primary.storage-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'attach.in.l2network',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.in.l2network',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
      },
      {
        key: 'detach.in.l2network',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.in.l2network',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
      },
      {
        key: 'attach.in.primary.storage',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.in.primary.storage',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
      },
      {
        key: 'detach.in.primary.storage',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.in.primary.storage',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
      },
      {
        key: 'attach.in.iscsi.server',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.in.iscsi.server',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
      },
      {
        key: 'detach.in.iscsi.server',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.in.iscsi.server',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
      },
      {
        key: 'attach.in.virtualization.iscsi.server',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.in.virtualization.iscsi.server',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
      },
      {
        key: 'detach.in.virtualization.iscsi.server',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.in.virtualization.iscsi.server',
          resource: 'baremetal2.cluster',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['edit', 'attach.l2network', 'detach.l2network', 'change.prosivion.network', 'attach.primary.storage', 'detach.primary.storage', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'attach.l2network', 'detach.l2network', 'change.prosivion.network', 'attach.primary.storage', 'detach.primary.storage', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.elastic.baremetal.cluster', 'enable', 'disable', 'delete'],
        activeKeys: [],
      },
      'sub.iscsi.server/row': {
        extraKeys: [],
        activeKeys: ['detach.in.iscsi.server'],
      },
      'sub.iscsi.server/toolbar': {
        extraKeys: ['attach.in.iscsi.server', 'detach.in.iscsi.server'],
        activeKeys: [],
      },
      'sub.l2.network/row': {
        extraKeys: [],
        activeKeys: ['detach.in.l2network'],
      },
      'sub.l2.network/toolbar': {
        extraKeys: ['attach.in.l2network', 'detach.in.l2network'],
        activeKeys: [],
      },
      'sub.primary.storage/row': {
        extraKeys: [],
        activeKeys: ['detach.in.primary.storage'],
      },
      'sub.primary.storage/toolbar': {
        extraKeys: ['attach.in.primary.storage', 'detach.in.primary.storage'],
        activeKeys: [],
      },
      'sub.provision.network/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.provision.network/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.iscsi.server/row': {
        extraKeys: [],
        activeKeys: ['detach.in.virtualization.iscsi.server'],
      },
      'sub.virtualization.iscsi.server/toolbar': {
        extraKeys: ['attach.in.virtualization.iscsi.server', 'detach.in.virtualization.iscsi.server'],
        activeKeys: [],
      },
      'sub.zone/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'attach.l2network', 'change.prosivion.network', 'attach.primary.storage', 'delete'],
      },
      'sub.zone/toolbar': {
        extraKeys: ['enable', 'disable', 'delete'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('baremetal2-cluster', intl).then(remoteConfig => {
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
