import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'add.data.storage' | 'register.vm' | 'start' | 'stop' | 'reconnection' | 'maintenance' | 'set.ceph.token' | 'edit.name.description' | 'virtualization.modify.advanced.config' | 'virtualization.set.resource.attribute' | 'consistency.check' | 'virtualization.primarystorage.attach.to.cluster' | 'virtualization.detach.from.cluster' | 'delete' | 'attach.in.cluster' | 'detach.in.cluster' | 'attach.alarm' | 'detach.alarm'

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
        key: 'add.data.storage',
        name: intl.formatMessage({ id: 'add.data.storage', defaultMessage: 'Add Data Storage' }),
        auth: {
          authKey: 'add.data.storage',
          resource: 'primary.storage',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'register.vm',
        name: intl.formatMessage({ id: 'register.vm', defaultMessage: 'Register VM' }),
        auth: {
          authKey: 'register.vm',
          resource: 'primary.storage',
          type: 'action'
        },
      },
      {
        key: 'register.vm-divider',
        divider: true,
      },
      {
        key: 'start',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'start',
          resource: 'primary.storage',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'stop',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'stop',
          resource: 'primary.storage',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'reconnection',
        name: intl.formatMessage({ id: 'reconnection', defaultMessage: 'Reconnect' }),
        auth: {
          authKey: 'reconnection',
          resource: 'primary.storage',
          type: 'action'
        },
      },
      {
        key: 'maintenance',
        name: intl.formatMessage({ id: 'enter.maintenanceMode', defaultMessage: 'Enter Maintenance Mode' }),
        auth: {
          authKey: 'maintenance',
          resource: 'primary.storage',
          type: 'action'
        },
      },
      {
        key: 'maintenance-divider',
        divider: true,
      },
      {
        key: 'set.ceph.token',
        name: intl.formatMessage({ id: 'set.ceph.access.token', defaultMessage: 'Set  Distributed Storage  Enterprise Access Token' }),
        auth: {
          authKey: 'set.ceph.token',
          resource: 'primary.storage',
          type: 'action'
        },
      },
      {
        key: 'edit.name.description',
        name: intl.formatMessage({ id: 'edit.name.description', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'edit.name.description',
          resource: 'primary.storage',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'virtualization.modify.advanced.config',
        name: intl.formatMessage({ id: 'virtualization.modify.advanced.config', defaultMessage: 'Modify Advanced Settings' }),
        auth: {
          authKey: 'virtualization.modify.advanced.config',
          resource: 'primary.storage',
          type: 'action'
        },
      },
      {
        key: 'virtualization.set.resource.attribute',
        name: intl.formatMessage({ id: 'set.resource.attribute', defaultMessage: 'Set Custom Attribute' }),
        auth: {
          authKey: 'virtualization.set.resource.attribute',
          resource: 'primary.storage',
          type: 'action'
        },
      },
      {
        key: 'consistency.check',
        name: intl.formatMessage({ id: 'consistency.check', defaultMessage: 'Consistency Check' }),
        auth: {
          authKey: 'consistency.check',
          resource: 'primary.storage',
          type: 'action'
        },
      },
      {
        key: 'consistency.check-divider',
        divider: true,
      },
      {
        key: 'virtualization.primarystorage.attach.to.cluster',
        name: intl.formatMessage({ id: 'attach.cluster', defaultMessage: 'Attach Cluster' }),
        auth: {
          authKey: 'virtualization.primarystorage.attach.to.cluster',
          resource: 'primary.storage',
          type: 'action'
        },
      },
      {
        key: 'virtualization.detach.from.cluster',
        name: intl.formatMessage({ id: 'detach.cluster', defaultMessage: 'Detach Cluster' }),
        auth: {
          authKey: 'virtualization.detach.from.cluster',
          resource: 'primary.storage',
          type: 'action'
        },
      },
      {
        key: 'virtualization.detach.from.cluster-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'primary.storage',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'attach.in.cluster',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.in.cluster',
          resource: 'primary.storage',
          type: 'action'
        },
      },
      {
        key: 'detach.in.cluster',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.in.cluster',
          resource: 'primary.storage',
          type: 'action'
        },
      },
      {
        key: 'attach.alarm',
        name: intl.formatMessage({ id: 'add', defaultMessage: 'Add' }),
        auth: {
          authKey: 'attach.alarm',
          resource: 'primary.storage',
          type: 'action'
        },
      },
      {
        key: 'detach.alarm',
        name: intl.formatMessage({ id: 'remove', defaultMessage: 'Remove' }),
        auth: {
          authKey: 'detach.alarm',
          resource: 'primary.storage',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['start', 'stop'],
        activeKeys: ['reconnection', 'maintenance', 'edit.name.description', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'reconnection', 'maintenance', 'edit.name.description', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['start', 'stop'],
        activeKeys: ['reconnection', 'maintenance', 'virtualization.set.resource.attribute', 'delete'],
      },
      'sub.alarm/row': {
        extraKeys: [],
        activeKeys: ['detach.alarm'],
      },
      'sub.alarm/toolbar': {
        extraKeys: ['attach.alarm', 'detach.alarm'],
        activeKeys: [],
      },
      'sub.cluster/row': {
        extraKeys: [],
        activeKeys: ['detach.in.cluster'],
      },
      'sub.cluster/toolbar': {
        extraKeys: ['attach.in.cluster', 'detach.in.cluster'],
        activeKeys: [],
      },
      'sub.virtualization.cluster/row': {
        extraKeys: [],
        activeKeys: ['register.vm', 'start', 'stop', 'reconnection', 'maintenance', 'edit.name.description', 'virtualization.modify.advanced.config', 'virtualization.set.resource.attribute', 'consistency.check', 'virtualization.primarystorage.attach.to.cluster', 'virtualization.detach.from.cluster', 'delete'],
      },
      'sub.virtualization.cluster/toolbar': {
        extraKeys: ['add.data.storage', 'start', 'stop'],
        activeKeys: ['reconnection', 'maintenance', 'virtualization.set.resource.attribute', 'delete'],
      },
      'sub.virtualization.fiber-channel-storage/row': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'reconnection', 'maintenance', 'edit.name.description', 'virtualization.set.resource.attribute', 'virtualization.primarystorage.attach.to.cluster', 'virtualization.detach.from.cluster', 'delete'],
      },
      'sub.virtualization.fiber-channel-storage/toolbar': {
        extraKeys: ['add.data.storage', 'start', 'stop'],
        activeKeys: ['reconnection', 'maintenance', 'virtualization.set.resource.attribute', 'delete'],
      },
      'sub.virtualization.iscsi.server/row': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'reconnection', 'maintenance', 'edit.name.description', 'virtualization.set.resource.attribute', 'virtualization.primarystorage.attach.to.cluster', 'virtualization.detach.from.cluster', 'delete'],
      },
      'sub.virtualization.iscsi.server/toolbar': {
        extraKeys: ['add.data.storage', 'start', 'stop'],
        activeKeys: ['reconnection', 'maintenance', 'virtualization.set.resource.attribute', 'delete'],
      },
      'sub.virtualization.nvme.target/row': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'reconnection', 'maintenance', 'edit.name.description', 'virtualization.set.resource.attribute', 'virtualization.primarystorage.attach.to.cluster', 'virtualization.detach.from.cluster', 'delete'],
      },
      'sub.virtualization.nvme.target/toolbar': {
        extraKeys: ['add.data.storage', 'start', 'stop'],
        activeKeys: ['reconnection', 'maintenance', 'virtualization.set.resource.attribute', 'delete'],
      },
      'sub.virtualization.zone/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.zone/row': {
        extraKeys: [],
        activeKeys: ['register.vm', 'start', 'stop', 'reconnection', 'maintenance', 'edit.name.description', 'virtualization.modify.advanced.config', 'virtualization.set.resource.attribute', 'consistency.check', 'virtualization.primarystorage.attach.to.cluster', 'virtualization.detach.from.cluster', 'delete'],
      },
      'sub.virtualization.zone/toolbar': {
        extraKeys: ['add.data.storage', 'start', 'stop'],
        activeKeys: ['reconnection', 'maintenance', 'virtualization.set.resource.attribute', 'delete'],
      },
      'sub.zone/row': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'reconnection', 'maintenance', 'delete'],
      },
      'sub.zone/toolbar': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'reconnection', 'maintenance', 'delete'],
      },
      'virtualization.dir/directory': {
        extraKeys: [],
        activeKeys: ['register.vm', 'start', 'stop', 'reconnection', 'maintenance', 'edit.name.description', 'virtualization.modify.advanced.config', 'virtualization.set.resource.attribute', 'consistency.check', 'virtualization.primarystorage.attach.to.cluster', 'virtualization.detach.from.cluster', 'delete'],
      },
      'virtualization.dir/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'virtualization.main/header': {
        extraKeys: [],
        activeKeys: ['register.vm', 'start', 'stop', 'reconnection', 'maintenance', 'edit.name.description', 'virtualization.modify.advanced.config', 'virtualization.set.resource.attribute', 'consistency.check', 'virtualization.primarystorage.attach.to.cluster', 'virtualization.detach.from.cluster', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('primary-storage', intl).then(remoteConfig => {
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
