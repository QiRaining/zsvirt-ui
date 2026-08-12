import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.rule.set' | 'edit' | 'sync.config' | 'add.rule' | 'attach' | 'dettach' | 'attach.ruleset' | 'dettach.ruleset' | 'delete'

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
        key: 'create.rule.set',
        name: intl.formatMessage({ id: 'create.ruleSet', defaultMessage: 'Create Rule Set' }),
        auth: {
          authKey: 'create.rule.set',
          resource: 'rule.set',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'rule.set',
          type: 'action'
        },
      },
      {
        key: 'sync.config',
        name: intl.formatMessage({ id: 'sync.config', defaultMessage: 'Synchronize Configurations' }),
        auth: {
          authKey: 'sync.config',
          resource: 'rule.set',
          type: 'action'
        },
        icon: 'sync',
      },
      {
        key: 'add.rule',
        name: intl.formatMessage({ id: 'add.rule', defaultMessage: 'Add Rule' }),
        auth: {
          authKey: 'add.rule',
          resource: 'rule.set',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'attach',
        name: intl.formatMessage({ id: 'bind.network', defaultMessage: 'Associate Network' }),
        auth: {
          authKey: 'attach',
          resource: 'rule.set',
          type: 'action'
        },
      },
      {
        key: 'dettach',
        name: intl.formatMessage({ id: 'unbind.network', defaultMessage: 'Disassociate Network' }),
        auth: {
          authKey: 'dettach',
          resource: 'rule.set',
          type: 'action'
        },
      },
      {
        key: 'attach.ruleset',
        name: intl.formatMessage({ id: 'bind.ruleset', defaultMessage: 'Associate Rule Set' }),
        auth: {
          authKey: 'attach.ruleset',
          resource: 'rule.set',
          type: 'action'
        },
      },
      {
        key: 'dettach.ruleset',
        name: intl.formatMessage({ id: 'unbind.ruleset', defaultMessage: 'Disassociate Rule Set' }),
        auth: {
          authKey: 'dettach.ruleset',
          resource: 'rule.set',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'rule.set',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['sync.config'],
        activeKeys: ['edit', 'attach', 'dettach', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'sync.config', 'add.rule', 'attach', 'dettach', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.rule.set', 'sync.config', 'delete'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['dettach.ruleset'],
      },
      'sub/toolbar': {
        extraKeys: ['attach.ruleset', 'dettach.ruleset'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('rule-set', intl).then(remoteConfig => {
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
