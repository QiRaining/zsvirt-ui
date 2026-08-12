import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.vm' | 'edit' | 'start' | 'stop' | 'reboot' | 'resume' | 'pause' | 'shutdown' | 'console' | 'clone' | 'migrate' | 'vm.migrate' | 'move.to.directory' | 'system.config' | 'modify.instance.offering' | 'change.owner' | 'set.ha' | 'set.console.password' | 'volume' | 'attach.volume' | 'detach.volume' | 'remove' | 'recover' | 'expunge'

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
        key: 'create.vm',
        name: intl.formatMessage({ id: 'create.vm', defaultMessage: 'New Virtual Machine' }),
        auth: {
          authKey: 'create.vm',
          resource: 'vcenter.vm',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'vcenter.vm',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'start',
        name: intl.formatMessage({ id: 'start', defaultMessage: 'Start' }),
        auth: {
          authKey: 'start',
          resource: 'vcenter.vm',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'stop',
        name: intl.formatMessage({ id: 'stop', defaultMessage: 'Stop' }),
        auth: {
          authKey: 'stop',
          resource: 'vcenter.vm',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'reboot',
        name: intl.formatMessage({ id: 'reboot', defaultMessage: 'Reboot' }),
        auth: {
          authKey: 'reboot',
          resource: 'vcenter.vm',
          type: 'action'
        },
      },
      {
        key: 'resume',
        name: intl.formatMessage({ id: 'resume', defaultMessage: 'Resume' }),
        auth: {
          authKey: 'resume',
          resource: 'vcenter.vm',
          type: 'action'
        },
      },
      {
        key: 'pause',
        name: intl.formatMessage({ id: 'pause', defaultMessage: 'Pause' }),
        auth: {
          authKey: 'pause',
          resource: 'vcenter.vm',
          type: 'action'
        },
      },
      {
        key: 'shutdown',
        name: intl.formatMessage({ id: 'shutdown', defaultMessage: 'Power Off' }),
        auth: {
          authKey: 'shutdown',
          resource: 'vcenter.vm',
          type: 'action'
        },
      },
      {
        key: 'shutdown-divider',
        divider: true,
      },
      {
        key: 'console',
        name: intl.formatMessage({ id: 'openConsole', defaultMessage: 'Launch Console' }),
        auth: {
          authKey: 'console',
          resource: 'vcenter.vm',
          type: 'action'
        },
      },
      {
        key: 'clone',
        name: intl.formatMessage({ id: 'clone', defaultMessage: 'Clone' }),
        auth: {
          authKey: 'clone',
          resource: 'vcenter.vm',
          type: 'action'
        },
      },
      {
        key: 'migrate',
        name: intl.formatMessage({ id: 'migrate', defaultMessage: 'Migrate' }),
        children: [
          {
            key: 'vm.migrate',
            name: intl.formatMessage({ id: 'migrate.vm', defaultMessage: 'Migrate VM' }),
            auth: {
              authKey: 'vm.migrate',
              resource: 'vcenter.vm',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'move.to.directory',
        name: intl.formatMessage({ id: 'move.to.directory', defaultMessage: 'Change Group' }),
        auth: {
          authKey: 'move.to.directory',
          resource: 'vcenter.vm',
          type: 'action'
        },
      },
      {
        key: 'system.config',
        name: intl.formatMessage({ id: 'systemConfig', defaultMessage: 'System Configurations' }),
        children: [
          {
            key: 'modify.instance.offering',
            name: intl.formatMessage({ id: 'modify.instanceOffering', defaultMessage: 'Modify Instance Offering' }),
            auth: {
              authKey: 'modify.instance.offering',
              resource: 'vcenter.vm',
              type: 'action'
            },
          },
          {
            key: 'change.owner',
            name: intl.formatMessage({ id: 'change.owner', defaultMessage: 'Change Owner' }),
            auth: {
              authKey: 'change.owner',
              resource: 'vcenter.vm',
              type: 'action'
            },
          },
          {
            key: 'set.ha',
            name: intl.formatMessage({ id: 'set.ha', defaultMessage: 'Set VM HA' }),
            auth: {
              authKey: 'set.ha',
              resource: 'vcenter.vm',
              type: 'action'
            },
          },
          {
            key: 'set.console.password',
            name: intl.formatMessage({ id: 'set.consolePassword', defaultMessage: 'Set Console Password' }),
            auth: {
              authKey: 'set.console.password',
              resource: 'vcenter.vm',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'volume',
        name: intl.formatMessage({ id: 'volume', defaultMessage: 'Disk' }),
        children: [
          {
            key: 'attach.volume',
            name: intl.formatMessage({ id: 'attach.volume', defaultMessage: 'Attach Volume' }),
            auth: {
              authKey: 'attach.volume',
              resource: 'vcenter.vm',
              type: 'action'
            },
          },
          {
            key: 'detach.volume',
            name: intl.formatMessage({ id: 'detach.volume', defaultMessage: 'Detach Disk' }),
            auth: {
              authKey: 'detach.volume',
              resource: 'vcenter.vm',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'volume-divider',
        divider: true,
      },
      {
        key: 'remove',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'remove',
          resource: 'vcenter.vm',
          type: 'action'
        },
      },
      {
        key: 'recover',
        name: intl.formatMessage({ id: 'recover', defaultMessage: 'Recover' }),
        auth: {
          authKey: 'recover',
          resource: 'vcenter.vm',
          type: 'action'
        },
      },
      {
        key: 'expunge',
        name: intl.formatMessage({ id: 'expunge', defaultMessage: 'Expunge' }),
        auth: {
          authKey: 'expunge',
          resource: 'vcenter.vm',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['start', 'stop'],
        activeKeys: ['reboot', 'resume', 'pause', 'shutdown', 'console', 'clone', 'migrate', 'vm.migrate', 'system.config', 'modify.instance.offering', 'change.owner', 'set.ha', 'set.console.password', 'volume', 'attach.volume', 'detach.volume', 'remove'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'reboot', 'resume', 'pause', 'shutdown', 'console', 'clone', 'migrate', 'vm.migrate', 'move.to.directory', 'system.config', 'modify.instance.offering', 'change.owner', 'set.ha', 'set.console.password', 'volume', 'attach.volume', 'detach.volume', 'remove'],
      },
      'main/toolbar': {
        extraKeys: ['create.vm', 'start', 'stop'],
        activeKeys: ['reboot', 'resume', 'pause', 'shutdown', 'move.to.directory', 'change.owner', 'set.ha', 'remove'],
      },
      'recycle/header': {
        extraKeys: ['recover', 'expunge'],
        activeKeys: [],
      },
      'recycle/row': {
        extraKeys: ['recover', 'expunge'],
        activeKeys: [],
      },
      'recycle/toolbar': {
        extraKeys: ['recover', 'expunge'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'reboot', 'resume', 'pause', 'shutdown', 'console', 'remove'],
      },
      'sub/toolbar': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'reboot', 'resume', 'pause', 'shutdown', 'remove'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('vcenter-vm', intl).then(remoteConfig => {
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
