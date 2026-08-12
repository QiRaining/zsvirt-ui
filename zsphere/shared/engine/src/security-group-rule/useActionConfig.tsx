import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'addRule' | 'enable' | 'disable' | 'adjust.priority' | 'modify.rule' | 'deleteRule'

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
        key: 'addRule',
        name: intl.formatMessage({ id: 'add.rule', defaultMessage: 'Add Rule' }),
        auth: {
          authKey: 'addRule',
          resource: 'security.group.rule',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'security.group.rule',
          type: 'action'
        },
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'security.group.rule',
          type: 'action'
        },
      },
      {
        key: 'adjust.priority',
        name: intl.formatMessage({ id: 'adjust.priority', defaultMessage: 'Adjust Priority' }),
        auth: {
          authKey: 'adjust.priority',
          resource: 'security.group.rule',
          type: 'action'
        },
      },
      {
        key: 'modify.rule',
        name: intl.formatMessage({ id: 'modify.rule', defaultMessage: 'Modify Rule' }),
        auth: {
          authKey: 'modify.rule',
          resource: 'security.group.rule',
          type: 'action'
        },
      },
      {
        key: 'modify.rule-divider',
        divider: true,
      },
      {
        key: 'deleteRule',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'deleteRule',
          resource: 'security.group.rule',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main.out/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'modify.rule', 'deleteRule'],
      },
      'main.out/toolbar': {
        extraKeys: ['addRule', 'enable', 'disable'],
        activeKeys: ['adjust.priority', 'deleteRule'],
      },
      'main/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'modify.rule', 'deleteRule'],
      },
      'main/toolbar': {
        extraKeys: ['addRule', 'enable', 'disable'],
        activeKeys: ['adjust.priority', 'deleteRule'],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['deleteRule'],
      },
      'sub/toolbar': {
        extraKeys: ['addRule', 'deleteRule'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('security-group-rule', intl).then(remoteConfig => {
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
