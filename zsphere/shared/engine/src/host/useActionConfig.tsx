import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.instance' | 'virtualization.add.host' | 'enable' | 'disable' | 'reconnection' | 'power.control' | 'power.control.power.on' | 'power.control.power.off' | 'power.control.reboot' | 'maintenance' | 'exit.maintenanceMode' | 'enter.web.terminal' | 'edit' | 'edit.config' | 'virtualization.zskernel.create' | 'virtualization.tag.and.attribute' | 'tag.management' | 'virtualization.set.resource.attribute' | 'add.bond' | 'update.ipmi.info' | 'update.ssh.info' | 'modify.password' | 'delete' | 'attach.alarm' | 'detach.alarm' | 'host.group.add.host' | 'host.group.remove.host' | 'virtualization.tag.attach.host' | 'virtualization.tag.detach.tag' | 'attach.to.l2VSwitch'

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
        key: 'create.instance',
        name: intl.formatMessage({ id: 'create.instance', defaultMessage: 'New Virtual Machine' }),
        auth: {
          authKey: 'create.instance',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'create.instance-divider',
        divider: true,
      },
      {
        key: 'virtualization.add.host',
        name: intl.formatMessage({ id: 'virtualization.add.host', defaultMessage: 'Add Host' }),
        auth: {
          authKey: 'virtualization.add.host',
          resource: 'host',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'host',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'host',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'reconnection',
        name: intl.formatMessage({ id: 'reconnect', defaultMessage: 'Reconnect' }),
        auth: {
          authKey: 'reconnection',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'power.control',
        name: intl.formatMessage({ id: 'power.control', defaultMessage: 'Power Control' }),
        children: [
          {
            key: 'power.control.power.on',
            name: intl.formatMessage({ id: 'power.on', defaultMessage: 'Power On' }),
            auth: {
              authKey: 'power.control.power.on',
              resource: 'host',
              type: 'action'
            },
          },
          {
            key: 'power.control.power.off',
            name: intl.formatMessage({ id: 'power.off', defaultMessage: 'Power Off' }),
            auth: {
              authKey: 'power.control.power.off',
              resource: 'host',
              type: 'action'
            },
          },
          {
            key: 'power.control.reboot',
            name: intl.formatMessage({ id: 'reboot', defaultMessage: 'Reboot' }),
            auth: {
              authKey: 'power.control.reboot',
              resource: 'host',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'maintenance',
        name: intl.formatMessage({ id: 'enter.maintenanceMode', defaultMessage: 'Enter Maintenance Mode' }),
        auth: {
          authKey: 'maintenance',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'exit.maintenanceMode',
        name: intl.formatMessage({ id: 'exit.maintenanceMode', defaultMessage: 'Exit Maintenance Mode' }),
        auth: {
          authKey: 'exit.maintenanceMode',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'enter.web.terminal',
        name: intl.formatMessage({ id: 'enter.web.terminal', defaultMessage: 'Enter Web Terminal' }),
        auth: {
          authKey: 'enter.web.terminal',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'enter.web.terminal-divider',
        divider: true,
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'host',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'edit.config',
        name: intl.formatMessage({ id: 'edit.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'edit.config',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'virtualization.zskernel.create',
        name: intl.formatMessage({ id: 'virtualization.zskernel.create', defaultMessage: 'New Kernel Adapter' }),
        auth: {
          authKey: 'virtualization.zskernel.create',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'virtualization.tag.and.attribute',
        name: intl.formatMessage({ id: 'virtualization.tag.and.attribute', defaultMessage: 'Tag and Attribute' }),
        children: [
          {
            key: 'tag.management',
            name: intl.formatMessage({ id: 'tag.management', defaultMessage: 'Tag Management' }),
            auth: {
              authKey: 'tag.management',
              resource: 'host',
              type: 'action'
            },
          },
          {
            key: 'virtualization.set.resource.attribute',
            name: intl.formatMessage({ id: 'set.resource.attribute', defaultMessage: 'Set Custom Attribute' }),
            auth: {
              authKey: 'virtualization.set.resource.attribute',
              resource: 'host',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'add.bond',
        name: intl.formatMessage({ id: 'add.AggPort', defaultMessage: 'Add Bond' }),
        auth: {
          authKey: 'add.bond',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'update.ipmi.info',
        name: intl.formatMessage({ id: 'update.ipmi.info', defaultMessage: 'Modify IPMI Info' }),
        auth: {
          authKey: 'update.ipmi.info',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'update.ssh.info',
        name: intl.formatMessage({ id: 'update.ssh.info', defaultMessage: 'Update SSH Information' }),
        auth: {
          authKey: 'update.ssh.info',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'modify.password',
        name: intl.formatMessage({ id: 'update.ssh.password', defaultMessage: 'Update SSH Password' }),
        auth: {
          authKey: 'modify.password',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'modify.password-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'attach.alarm',
        name: intl.formatMessage({ id: 'add', defaultMessage: 'Add' }),
        auth: {
          authKey: 'attach.alarm',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'detach.alarm',
        name: intl.formatMessage({ id: 'remove', defaultMessage: 'Remove' }),
        auth: {
          authKey: 'detach.alarm',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'host.group.add.host',
        name: intl.formatMessage({ id: 'host.group.add.host', defaultMessage: 'Add Host' }),
        auth: {
          authKey: 'host.group.add.host',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'host.group.remove.host',
        name: intl.formatMessage({ id: 'host.group.remove.host', defaultMessage: 'Remove Host' }),
        auth: {
          authKey: 'host.group.remove.host',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'virtualization.tag.attach.host',
        name: intl.formatMessage({ id: 'virtualization.bind', defaultMessage: 'Associate' }),
        auth: {
          authKey: 'virtualization.tag.attach.host',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'virtualization.tag.detach.tag',
        name: intl.formatMessage({ id: 'virtualization.unbind', defaultMessage: 'Disassociate' }),
        auth: {
          authKey: 'virtualization.tag.detach.tag',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'attach.to.l2VSwitch',
        name: intl.formatMessage({ id: 'join.bond', defaultMessage: 'Join Uplink' }),
        auth: {
          authKey: 'attach.to.l2VSwitch',
          resource: 'host',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['reconnection', 'power.control', 'power.control.power.on', 'power.control.power.off', 'power.control.reboot', 'maintenance', 'enter.web.terminal', 'edit', 'add.bond', 'update.ipmi.info', 'modify.password', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'reconnection', 'power.control', 'power.control.power.on', 'power.control.power.off', 'power.control.reboot', 'maintenance', 'enter.web.terminal', 'edit', 'add.bond', 'update.ipmi.info', 'modify.password', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['reconnection', 'power.control', 'power.control.power.on', 'power.control.power.off', 'power.control.reboot', 'maintenance', 'add.bond', 'delete'],
      },
      'sub.alarm/row': {
        extraKeys: [],
        activeKeys: ['detach.alarm'],
      },
      'sub.alarm/toolbar': {
        extraKeys: ['attach.alarm', 'detach.alarm'],
        activeKeys: [],
      },
      'sub.host-group/row': {
        extraKeys: [],
        activeKeys: ['host.group.remove.host'],
      },
      'sub.host-group/toolbar': {
        extraKeys: ['host.group.add.host', 'host.group.remove.host'],
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
      'sub.virtualization.cluster/row': {
        extraKeys: [],
        activeKeys: ['create.instance', 'enable', 'disable', 'reconnection', 'power.control', 'power.control.power.on', 'power.control.power.off', 'power.control.reboot', 'maintenance', 'exit.maintenanceMode', 'enter.web.terminal', 'edit', 'edit.config', 'virtualization.tag.and.attribute', 'tag.management', 'virtualization.set.resource.attribute', 'update.ipmi.info', 'update.ssh.info', 'delete'],
      },
      'sub.virtualization.cluster/toolbar': {
        extraKeys: ['virtualization.add.host', 'enable', 'disable'],
        activeKeys: ['reconnection', 'power.control', 'power.control.power.on', 'power.control.power.off', 'power.control.reboot', 'maintenance', 'exit.maintenanceMode', 'virtualization.tag.and.attribute', 'tag.management', 'virtualization.set.resource.attribute', 'delete'],
      },
      'sub.virtualization.fiber-channel-lun/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'reconnection', 'power.control', 'power.control.power.on', 'power.control.power.off', 'power.control.reboot', 'maintenance', 'exit.maintenanceMode', 'delete'],
      },
      'sub.virtualization.fiber-channel-lun/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.host-group/row': {
        extraKeys: [],
        activeKeys: ['host.group.remove.host'],
      },
      'sub.virtualization.host-group/toolbar': {
        extraKeys: ['host.group.add.host', 'host.group.remove.host'],
        activeKeys: [],
      },
      'sub.virtualization.iscsi.lun/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'reconnection', 'power.control', 'power.control.power.on', 'power.control.power.off', 'power.control.reboot', 'maintenance', 'exit.maintenanceMode', 'delete'],
      },
      'sub.virtualization.iscsi.lun/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.not.in.vswitch/row': {
        extraKeys: [],
        activeKeys: ['attach.to.l2VSwitch'],
      },
      'sub.virtualization.not.in.vswitch/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.nvmelun/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'reconnection', 'power.control', 'power.control.power.on', 'power.control.power.off', 'power.control.reboot', 'maintenance', 'exit.maintenanceMode', 'delete'],
      },
      'sub.virtualization.primary.storage/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'reconnection', 'power.control', 'power.control.power.on', 'power.control.power.off', 'power.control.reboot', 'maintenance', 'exit.maintenanceMode', 'enter.web.terminal', 'edit', 'edit.config', 'virtualization.tag.and.attribute', 'tag.management', 'virtualization.set.resource.attribute', 'update.ipmi.info', 'update.ssh.info', 'modify.password', 'delete'],
      },
      'sub.virtualization.primary.storage/toolbar': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['reconnection', 'power.control', 'power.control.power.on', 'power.control.power.off', 'power.control.reboot', 'maintenance', 'exit.maintenanceMode', 'virtualization.tag.and.attribute', 'tag.management', 'virtualization.set.resource.attribute', 'delete'],
      },
      'sub.virtualization.tag/row': {
        extraKeys: [],
        activeKeys: ['virtualization.tag.detach.tag'],
      },
      'sub.virtualization.tag/toolbar': {
        extraKeys: ['virtualization.tag.attach.host', 'virtualization.tag.detach.tag'],
        activeKeys: [],
      },
      'sub.virtualization.zone/row': {
        extraKeys: [],
        activeKeys: ['create.instance', 'enable', 'disable', 'reconnection', 'power.control', 'power.control.power.on', 'power.control.power.off', 'power.control.reboot', 'maintenance', 'exit.maintenanceMode', 'enter.web.terminal', 'edit', 'edit.config', 'virtualization.tag.and.attribute', 'tag.management', 'virtualization.set.resource.attribute', 'update.ipmi.info', 'update.ssh.info', 'delete'],
      },
      'sub.virtualization.zone/toolbar': {
        extraKeys: ['virtualization.add.host', 'enable', 'disable'],
        activeKeys: ['reconnection', 'power.control', 'power.control.power.on', 'power.control.power.off', 'power.control.reboot', 'maintenance', 'exit.maintenanceMode', 'virtualization.tag.and.attribute', 'tag.management', 'virtualization.set.resource.attribute', 'delete'],
      },
      'virtualization.dir/directory': {
        extraKeys: [],
        activeKeys: ['create.instance', 'enable', 'disable', 'reconnection', 'power.control', 'power.control.power.on', 'power.control.power.off', 'power.control.reboot', 'maintenance', 'exit.maintenanceMode', 'enter.web.terminal', 'edit', 'edit.config', 'virtualization.zskernel.create', 'virtualization.tag.and.attribute', 'tag.management', 'virtualization.set.resource.attribute', 'update.ipmi.info', 'update.ssh.info', 'delete'],
      },
      'virtualization.main/header': {
        extraKeys: [],
        activeKeys: ['create.instance', 'enable', 'disable', 'reconnection', 'power.control', 'power.control.power.on', 'power.control.power.off', 'power.control.reboot', 'maintenance', 'exit.maintenanceMode', 'enter.web.terminal', 'edit', 'edit.config', 'virtualization.zskernel.create', 'virtualization.tag.and.attribute', 'tag.management', 'virtualization.set.resource.attribute', 'update.ipmi.info', 'update.ssh.info', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('host', intl).then(remoteConfig => {
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
