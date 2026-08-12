import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.port.forwarding' | 'edit' | 'attach.vm.nic' | 'detach.vm.nic' | 'delete'

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
        key: 'create.port.forwarding',
        name: intl.formatMessage({ id: 'create.portForwarding', defaultMessage: 'Create Port Forwarding' }),
        auth: {
          authKey: 'create.port.forwarding',
          resource: 'port.forwarding',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'port.forwarding',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'attach.vm.nic',
        name: intl.formatMessage({ id: 'attach.vmNic', defaultMessage: 'Associate VM NIC' }),
        auth: {
          authKey: 'attach.vm.nic',
          resource: 'port.forwarding',
          type: 'action'
        },
      },
      {
        key: 'detach.vm.nic',
        name: intl.formatMessage({ id: 'detach.vmNic', defaultMessage: 'Disassociate VM NIC' }),
        auth: {
          authKey: 'detach.vm.nic',
          resource: 'port.forwarding',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'port.forwarding',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'attach.vm.nic', 'detach.vm.nic', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'attach.vm.nic', 'detach.vm.nic', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.port.forwarding', 'delete'],
        activeKeys: [],
      },
      'sub.vpc/row': {
        extraKeys: ['delete'],
        activeKeys: [],
      },
      'sub.vpc/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: ['delete'],
        activeKeys: [],
      },
      'sub/toolbar': {
        extraKeys: ['create.port.forwarding', 'delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('port-forwarding', intl).then(remoteConfig => {
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
