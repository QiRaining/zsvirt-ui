import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'edit' | 'create.vpc' | 'open.console' | 'start' | 'stop' | 'reboot' | 'reconnect' | 'set.console.password' | 'vpc.migrate' | 'migrate.host' | 'change.host.and.primary.storage' | 'setHaStickStragedy' | 'delete' | 'routeTable.attach' | 'routeTable.detach' | 'attach.alarm' | 'detach.alarm'

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
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'vpc.vrouter',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'create.vpc',
        name: intl.formatMessage({ id: 'create.vpcVrouter', defaultMessage: 'Create VPC vRouter' }),
        auth: {
          authKey: 'create.vpc',
          resource: 'vpc.vrouter',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'open.console',
        name: intl.formatMessage({ id: 'open.console', defaultMessage: 'Launch Console' }),
        auth: {
          authKey: 'open.console',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
      {
        key: 'start',
        name: intl.formatMessage({ id: 'start', defaultMessage: 'Start' }),
        auth: {
          authKey: 'start',
          resource: 'vpc.vrouter',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'stop',
        name: intl.formatMessage({ id: 'stop', defaultMessage: 'Stop' }),
        auth: {
          authKey: 'stop',
          resource: 'vpc.vrouter',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'reboot',
        name: intl.formatMessage({ id: 'reboot', defaultMessage: 'Reboot' }),
        auth: {
          authKey: 'reboot',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
      {
        key: 'reconnect',
        name: intl.formatMessage({ id: 'reconnect', defaultMessage: 'Reconnect' }),
        auth: {
          authKey: 'reconnect',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
      {
        key: 'reconnect-divider',
        divider: true,
      },
      {
        key: 'set.console.password',
        name: intl.formatMessage({ id: 'set.consolePassword', defaultMessage: 'Set Console Password' }),
        auth: {
          authKey: 'set.console.password',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
      {
        key: 'set.console.password-divider',
        divider: true,
      },
      {
        key: 'vpc.migrate',
        name: intl.formatMessage({ id: 'migrate', defaultMessage: 'Migrate' }),
        children: [
          {
            key: 'migrate.host',
            name: intl.formatMessage({ id: 'vpc.vrouter.migrate.change.host', defaultMessage: 'Change Host' }),
            auth: {
              authKey: 'migrate.host',
              resource: 'vpc.vrouter',
              type: 'action'
            },
          },
          {
            key: 'change.host.and.primary.storage',
            name: intl.formatMessage({ id: 'vm.migrate.change.hostAndPrimaryStorage', defaultMessage: 'Change Host and Data Storage' }),
            auth: {
              authKey: 'change.host.and.primary.storage',
              resource: 'vpc.vrouter',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'setHaStickStragedy',
        name: intl.formatMessage({ id: 'set.haStickStragedy', defaultMessage: 'Set Cross-Cluster HA' }),
        auth: {
          authKey: 'setHaStickStragedy',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
      {
        key: 'setHaStickStragedy-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
      {
        key: 'routeTable.attach',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'routeTable.attach',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
      {
        key: 'routeTable.detach',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'routeTable.detach',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
      {
        key: 'attach.alarm',
        name: intl.formatMessage({ id: 'add', defaultMessage: 'Add' }),
        auth: {
          authKey: 'attach.alarm',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
      {
        key: 'detach.alarm',
        name: intl.formatMessage({ id: 'remove', defaultMessage: 'Remove' }),
        auth: {
          authKey: 'detach.alarm',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['start', 'stop'],
        activeKeys: ['edit', 'open.console', 'reboot', 'reconnect', 'set.console.password', 'migrate.host', 'change.host.and.primary.storage', 'setHaStickStragedy', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'open.console', 'start', 'stop', 'reboot', 'reconnect', 'set.console.password', 'migrate.host', 'change.host.and.primary.storage', 'setHaStickStragedy', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.vpc', 'start', 'stop'],
        activeKeys: ['reboot', 'reconnect', 'delete'],
      },
      'sub.account/row': {
        extraKeys: [],
        activeKeys: ['open.console', 'start', 'stop', 'reboot', 'reconnect', 'set.console.password', 'migrate.host', 'delete'],
      },
      'sub.account/toolbar': {
        extraKeys: ['start', 'stop'],
        activeKeys: ['reboot', 'reconnect', 'delete'],
      },
      'sub.alarm/row': {
        extraKeys: ['detach.alarm'],
        activeKeys: [],
      },
      'sub.alarm/toolbar': {
        extraKeys: ['attach.alarm', 'detach.alarm'],
        activeKeys: [],
      },
      'sub.host/row': {
        extraKeys: [],
        activeKeys: ['edit', 'open.console', 'start', 'stop', 'reboot', 'reconnect', 'set.console.password', 'migrate.host', 'change.host.and.primary.storage', 'setHaStickStragedy', 'delete'],
      },
      'sub.host/toolbar': {
        extraKeys: ['start', 'stop'],
        activeKeys: ['reboot', 'reconnect', 'delete'],
      },
      'sub.node/header': {
        extraKeys: ['start', 'stop'],
        activeKeys: ['reboot', 'reconnect', 'migrate.host'],
      },
      'sub.primary.storage/row': {
        extraKeys: [],
        activeKeys: ['edit', 'open.console', 'start', 'stop', 'reboot', 'reconnect', 'set.console.password', 'migrate.host', 'change.host.and.primary.storage', 'setHaStickStragedy', 'delete'],
      },
      'sub.primary.storage/toolbar': {
        extraKeys: ['start', 'stop'],
        activeKeys: ['reboot', 'reconnect', 'delete'],
      },
      'sub.project/row': {
        extraKeys: [],
        activeKeys: ['open.console', 'start', 'stop', 'reboot', 'reconnect', 'set.console.password', 'migrate.host', 'delete'],
      },
      'sub.project/toolbar': {
        extraKeys: ['start', 'stop'],
        activeKeys: ['reboot', 'reconnect', 'delete'],
      },
      'sub.v-router-route-table/row': {
        extraKeys: [],
        activeKeys: ['routeTable.detach'],
      },
      'sub.v-router-route-table/toolbar': {
        extraKeys: ['routeTable.attach', 'routeTable.detach'],
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
      genActionFromRemote('vpc-vrouter', intl).then(remoteConfig => {
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
