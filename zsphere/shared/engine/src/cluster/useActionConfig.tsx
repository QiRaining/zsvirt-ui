import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'add.host' | 'virtualization.create.instance' | 'create.l3Network' | 'add.dataStorage' | 'virtualization.create.cluster' | 'edit' | 'modify.config' | 'virtualization.advanced.config' | 'virtualization.modify.network.setting' | 'virtualization.modify.resource.config' | 'virtualization.modify.host.setting' | 'virtualization.modify.vm.setting' | 'enable' | 'disable' | 'attach.in.virtualization.primary.storage' | 'detach.in.virtualization.primary.storage' | 'virtualization.attach.to.l2.network' | 'virtualization.detach.from.l2.network' | 'virtualization.iscsi.server.attach.cluster' | 'virtualization.iscsi.server.detach.cluster' | 'virtualization.attach.l2.network' | 'virtualization.detach.l2.network' | 'virtualization.attach.primaryStorage' | 'virtualization.detach.primaryStorage' | 'delete' | 'virtualization.nvmeServer.attach.cluster' | 'virtualization.nvmeServer.detach.cluster'

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
        key: 'add.host',
        name: intl.formatMessage({ id: 'add.host', defaultMessage: 'Add Host' }),
        auth: {
          authKey: 'add.host',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'virtualization.create.instance',
        name: intl.formatMessage({ id: 'virtualization.create.instance.from.cluster', defaultMessage: 'New Virtual Machine' }),
        auth: {
          authKey: 'virtualization.create.instance',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'create.l3Network',
        name: intl.formatMessage({ id: 'virtualization.cluster.create.l3Network', defaultMessage: 'New Distributed Switch' }),
        auth: {
          authKey: 'create.l3Network',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'add.dataStorage',
        name: intl.formatMessage({ id: 'add.dataStorage', defaultMessage: 'Add Data Storage' }),
        auth: {
          authKey: 'add.dataStorage',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'add.dataStorage-divider',
        divider: true,
      },
      {
        key: 'virtualization.create.cluster',
        name: intl.formatMessage({ id: 'create.cluster', defaultMessage: 'New Cluster' }),
        auth: {
          authKey: 'virtualization.create.cluster',
          resource: 'cluster',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'cluster',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'modify.config',
        name: intl.formatMessage({ id: 'modify.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'modify.config',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'virtualization.advanced.config',
        name: intl.formatMessage({ id: 'virtualization.advanced.config', defaultMessage: 'Advanced Settings' }),
        children: [
          {
            key: 'virtualization.modify.network.setting',
            name: intl.formatMessage({ id: 'virtualization.modify.network.setting', defaultMessage: 'Edit Cluster Network' }),
            auth: {
              authKey: 'virtualization.modify.network.setting',
              resource: 'cluster',
              type: 'action'
            },
          },
          {
            key: 'virtualization.modify.resource.config',
            name: intl.formatMessage({ id: 'virtualization.modify.resource.config', defaultMessage: 'Edit Cluster Overcommit' }),
            auth: {
              authKey: 'virtualization.modify.resource.config',
              resource: 'cluster',
              type: 'action'
            },
          },
          {
            key: 'virtualization.modify.host.setting',
            name: intl.formatMessage({ id: 'virtualization.modify.host.setting', defaultMessage: 'Edit Host Settings' }),
            auth: {
              authKey: 'virtualization.modify.host.setting',
              resource: 'cluster',
              type: 'action'
            },
          },
          {
            key: 'virtualization.modify.vm.setting',
            name: intl.formatMessage({ id: 'virtualization.modify.vm.setting', defaultMessage: 'Edit VM Settings' }),
            auth: {
              authKey: 'virtualization.modify.vm.setting',
              resource: 'cluster',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'virtualization.advanced.config-divider',
        divider: true,
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'cluster',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'cluster',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'disable-divider',
        divider: true,
      },
      {
        key: 'attach.in.virtualization.primary.storage',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.in.virtualization.primary.storage',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'detach.in.virtualization.primary.storage',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.in.virtualization.primary.storage',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'virtualization.attach.to.l2.network',
        name: intl.formatMessage({ id: 'virtualization.attach.cluster', defaultMessage: 'Attach Cluster' }),
        auth: {
          authKey: 'virtualization.attach.to.l2.network',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'virtualization.detach.from.l2.network',
        name: intl.formatMessage({ id: 'virtualization.detach.cluster', defaultMessage: 'Detach Cluster' }),
        auth: {
          authKey: 'virtualization.detach.from.l2.network',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'virtualization.iscsi.server.attach.cluster',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'virtualization.iscsi.server.attach.cluster',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'virtualization.iscsi.server.detach.cluster',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'virtualization.iscsi.server.detach.cluster',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'virtualization.attach.l2.network',
        name: intl.formatMessage({ id: 'virtualization.attach.l2.network', defaultMessage: 'Loading Distributed Switch.' }),
        auth: {
          authKey: 'virtualization.attach.l2.network',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'virtualization.detach.l2.network',
        name: intl.formatMessage({ id: 'virtualization.detach.l2.network', defaultMessage: 'Uninstall Distributed Switch.' }),
        auth: {
          authKey: 'virtualization.detach.l2.network',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'virtualization.attach.primaryStorage',
        name: intl.formatMessage({ id: 'virtualization.attach.primaryStorage', defaultMessage: 'Attach Data Storage' }),
        auth: {
          authKey: 'virtualization.attach.primaryStorage',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'virtualization.detach.primaryStorage',
        name: intl.formatMessage({ id: 'virtualization.detach.primaryStorage', defaultMessage: 'Detach Data Storage' }),
        auth: {
          authKey: 'virtualization.detach.primaryStorage',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'cluster',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'virtualization.nvmeServer.attach.cluster',
        name: intl.formatMessage({ id: 'virtualization.attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'virtualization.nvmeServer.attach.cluster',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'virtualization.nvmeServer.detach.cluster',
        name: intl.formatMessage({ id: 'virtualization.detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'virtualization.nvmeServer.detach.cluster',
          resource: 'cluster',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['edit', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['enable', 'disable', 'delete'],
        activeKeys: [],
      },
      'sub.virtualization.iscsi.server/row': {
        extraKeys: [],
        activeKeys: ['virtualization.iscsi.server.detach.cluster'],
      },
      'sub.virtualization.iscsi.server/toolbar': {
        extraKeys: ['virtualization.iscsi.server.attach.cluster', 'virtualization.iscsi.server.detach.cluster'],
        activeKeys: [],
      },
      'sub.virtualization.l2.network.baremetal/row': {
        extraKeys: [],
        activeKeys: ['virtualization.detach.from.l2.network'],
      },
      'sub.virtualization.l2.network.baremetal/toolbar': {
        extraKeys: ['virtualization.attach.to.l2.network', 'virtualization.detach.from.l2.network'],
        activeKeys: [],
      },
      'sub.virtualization.l2.network.normal/row': {
        extraKeys: [],
        activeKeys: ['virtualization.detach.from.l2.network'],
      },
      'sub.virtualization.l2.network.normal/toolbar': {
        extraKeys: ['virtualization.attach.to.l2.network', 'virtualization.detach.from.l2.network'],
        activeKeys: [],
      },
      'sub.virtualization.l2.network/row': {
        extraKeys: [],
        activeKeys: ['virtualization.detach.from.l2.network'],
      },
      'sub.virtualization.l2.network/toolbar': {
        extraKeys: ['virtualization.attach.to.l2.network', 'virtualization.detach.from.l2.network'],
        activeKeys: [],
      },
      'sub.virtualization.nvme/row': {
        extraKeys: [],
        activeKeys: ['virtualization.nvmeServer.detach.cluster'],
      },
      'sub.virtualization.nvme/toolbar': {
        extraKeys: ['virtualization.nvmeServer.attach.cluster', 'virtualization.nvmeServer.detach.cluster'],
        activeKeys: [],
      },
      'sub.virtualization.primary.storage/row': {
        extraKeys: [],
        activeKeys: ['add.host', 'virtualization.create.instance', 'create.l3Network', 'edit', 'detach.in.virtualization.primary.storage', 'delete'],
      },
      'sub.virtualization.primary.storage/toolbar': {
        extraKeys: ['attach.in.virtualization.primary.storage', 'detach.in.virtualization.primary.storage'],
        activeKeys: [],
      },
      'sub.virtualization.zone/row': {
        extraKeys: [],
        activeKeys: ['add.host', 'virtualization.create.instance', 'create.l3Network', 'add.dataStorage', 'edit', 'delete'],
      },
      'sub.virtualization.zone/toolbar': {
        extraKeys: ['virtualization.create.cluster', 'delete'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'delete'],
      },
      'virtualization.dir/directory': {
        extraKeys: [],
        activeKeys: ['add.host', 'virtualization.create.instance', 'create.l3Network', 'add.dataStorage', 'edit', 'virtualization.advanced.config', 'virtualization.modify.network.setting', 'virtualization.modify.resource.config', 'virtualization.modify.host.setting', 'virtualization.modify.vm.setting', 'delete'],
      },
      'virtualization.main/header': {
        extraKeys: [],
        activeKeys: ['add.host', 'virtualization.create.instance', 'create.l3Network', 'add.dataStorage', 'edit', 'virtualization.advanced.config', 'virtualization.modify.network.setting', 'virtualization.modify.resource.config', 'virtualization.modify.host.setting', 'virtualization.modify.vm.setting', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('cluster', intl).then(remoteConfig => {
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
