import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'add.snmp.trap' | 'edit' | 'virtualization.add' | 'modify.config' | 'delete'

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
        key: 'add.snmp.trap',
        name: intl.formatMessage({ id: 'add.snmp.trap', defaultMessage: 'Add SNMP Trap Receiver' }),
        auth: {
          authKey: 'add.snmp.trap',
          resource: 'snmp.trap',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'snmp.trap',
          type: 'action'
        },
      },
      {
        key: 'virtualization.add',
        name: intl.formatMessage({ id: 'virtualization.add.trap', defaultMessage: 'Add SNMP Trap Receiver' }),
        auth: {
          authKey: 'virtualization.add',
          resource: 'snmp.trap',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'modify.config',
        name: intl.formatMessage({ id: 'modify.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'modify.config',
          resource: 'snmp.trap',
          type: 'action'
        },
      },
      {
        key: 'modify.config-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'snmp.trap',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['add.snmp.trap', 'delete'],
        activeKeys: [],
      },
      'virtualization.main/header': {
        extraKeys: ['modify.config', 'delete'],
        activeKeys: [],
      },
      'virtualization.main/row': {
        extraKeys: [],
        activeKeys: ['modify.config', 'delete'],
      },
      'virtualization.main/toolbar': {
        extraKeys: ['virtualization.add', 'delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('snmp-trap', intl).then(remoteConfig => {
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
