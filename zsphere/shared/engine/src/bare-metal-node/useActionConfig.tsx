import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'edit.bareMetalChassis' | 'add.bareMetalChassis' | 'enable.bareMetalChassis' | 'disable.bareMetalChassis' | 'poweron.bareMetalChassis' | 'poweroff.bareMetalChassis' | 'restart.bareMetalChassis' | 'find.bareMetalChassis' | 'update.bareMetalChassis.ipmiInfo' | 'open.bareMetalChassis.Console' | 'delete.bareMetalChassis'

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
        key: 'edit.bareMetalChassis',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit.bareMetalChassis',
          resource: 'bare.metal.node',
          type: 'action'
        },
      },
      {
        key: 'add.bareMetalChassis',
        name: intl.formatMessage({ id: 'add.bareMetalNode', defaultMessage: 'Add Baremetal Node' }),
        auth: {
          authKey: 'add.bareMetalChassis',
          resource: 'bare.metal.node',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'enable.bareMetalChassis',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable.bareMetalChassis',
          resource: 'bare.metal.node',
          type: 'action'
        },
      },
      {
        key: 'disable.bareMetalChassis',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable.bareMetalChassis',
          resource: 'bare.metal.node',
          type: 'action'
        },
      },
      {
        key: 'poweron.bareMetalChassis',
        name: intl.formatMessage({ id: 'power.on', defaultMessage: 'Power On' }),
        auth: {
          authKey: 'poweron.bareMetalChassis',
          resource: 'bare.metal.node',
          type: 'action'
        },
      },
      {
        key: 'poweroff.bareMetalChassis',
        name: intl.formatMessage({ id: 'shutdown', defaultMessage: 'Power Off' }),
        auth: {
          authKey: 'poweroff.bareMetalChassis',
          resource: 'bare.metal.node',
          type: 'action'
        },
      },
      {
        key: 'restart.bareMetalChassis',
        name: intl.formatMessage({ id: 'restart', defaultMessage: 'Reboot' }),
        auth: {
          authKey: 'restart.bareMetalChassis',
          resource: 'bare.metal.node',
          type: 'action'
        },
      },
      {
        key: 'restart.bareMetalChassis-divider',
        divider: true,
      },
      {
        key: 'find.bareMetalChassis',
        name: intl.formatMessage({ id: 'find.node', defaultMessage: 'Obtain Hardware Information' }),
        auth: {
          authKey: 'find.bareMetalChassis',
          resource: 'bare.metal.node',
          type: 'action'
        },
      },
      {
        key: 'update.bareMetalChassis.ipmiInfo',
        name: intl.formatMessage({ id: 'update.bareMetalChassis.ipmiInfo', defaultMessage: 'Update IPMI Info' }),
        auth: {
          authKey: 'update.bareMetalChassis.ipmiInfo',
          resource: 'bare.metal.node',
          type: 'action'
        },
      },
      {
        key: 'open.bareMetalChassis.Console',
        name: intl.formatMessage({ id: 'open.console', defaultMessage: 'Launch Console' }),
        auth: {
          authKey: 'open.bareMetalChassis.Console',
          resource: 'bare.metal.node',
          type: 'action'
        },
      },
      {
        key: 'open.bareMetalChassis.Console-divider',
        divider: true,
      },
      {
        key: 'delete.bareMetalChassis',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete.bareMetalChassis',
          resource: 'bare.metal.node',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['enable.bareMetalChassis', 'disable.bareMetalChassis'],
        activeKeys: ['edit.bareMetalChassis', 'poweron.bareMetalChassis', 'poweroff.bareMetalChassis', 'restart.bareMetalChassis', 'find.bareMetalChassis', 'update.bareMetalChassis.ipmiInfo', 'open.bareMetalChassis.Console', 'delete.bareMetalChassis'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit.bareMetalChassis', 'enable.bareMetalChassis', 'disable.bareMetalChassis', 'poweron.bareMetalChassis', 'poweroff.bareMetalChassis', 'restart.bareMetalChassis', 'find.bareMetalChassis', 'update.bareMetalChassis.ipmiInfo', 'open.bareMetalChassis.Console', 'delete.bareMetalChassis'],
      },
      'main/toolbar': {
        extraKeys: ['add.bareMetalChassis', 'enable.bareMetalChassis', 'disable.bareMetalChassis'],
        activeKeys: ['poweroff.bareMetalChassis', 'restart.bareMetalChassis', 'find.bareMetalChassis', 'delete.bareMetalChassis'],
      },
      'sub.baremetal2.cluster/row': {
        extraKeys: [],
        activeKeys: ['enable.bareMetalChassis', 'disable.bareMetalChassis', 'poweron.bareMetalChassis', 'poweroff.bareMetalChassis', 'restart.bareMetalChassis', 'find.bareMetalChassis', 'open.bareMetalChassis.Console', 'delete.bareMetalChassis'],
      },
      'sub.baremetal2.cluster/toolbar': {
        extraKeys: ['add.bareMetalChassis'],
        activeKeys: ['enable.bareMetalChassis', 'disable.bareMetalChassis', 'delete.bareMetalChassis'],
      },
      'sub.baremetal2.offering/toolbar': {
        extraKeys: ['enable.bareMetalChassis', 'disable.bareMetalChassis', 'delete.bareMetalChassis'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('bare-metal-node', intl).then(remoteConfig => {
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
