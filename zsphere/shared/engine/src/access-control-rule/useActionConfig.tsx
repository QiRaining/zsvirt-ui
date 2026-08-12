import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'virtualization.add.accessControlRule' | 'edit' | 'modify.config' | 'delete'

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
        key: 'virtualization.add.accessControlRule',
        name: intl.formatMessage({ id: 'virtualization.add.accessControlRule', defaultMessage: 'Add IP Allowlist/Blocklist' }),
        auth: {
          authKey: 'virtualization.add.accessControlRule',
          resource: 'access.control.rule',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'access.control.rule',
          type: 'action'
        },
      },
      {
        key: 'modify.config',
        name: intl.formatMessage({ id: 'modify.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'modify.config',
          resource: 'access.control.rule',
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
          resource: 'access.control.rule',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main.virtualization/header': {
        extraKeys: ['edit'],
        activeKeys: ['modify.config', 'delete'],
      },
      'main.virtualization/row': {
        extraKeys: [],
        activeKeys: ['edit', 'modify.config', 'delete'],
      },
      'main.virtualization/toolbar': {
        extraKeys: ['virtualization.add.accessControlRule', 'delete'],
        activeKeys: [],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['delete'],
        activeKeys: [],
      },
      'sub.virtualization/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('access-control-rule', intl).then(remoteConfig => {
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
