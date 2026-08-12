import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'add.event.rule.template' | 'modify' | 'delete'

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
        key: 'add.event.rule.template',
        name: intl.formatMessage({ id: 'add.eventAlarmRule', defaultMessage: 'Add Event Alarm Rule' }),
        auth: {
          authKey: 'add.event.rule.template',
          resource: 'event.rule.template',
          type: 'action'
        },
      },
      {
        key: 'modify',
        name: intl.formatMessage({ id: 'modify', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'modify',
          resource: 'event.rule.template',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'event.rule.template',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['modify', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['modify', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['add.event.rule.template'],
        activeKeys: ['modify', 'delete'],
      },
      'sub/toolbar': {
        extraKeys: ['modify', 'delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('event-rule-template', intl).then(remoteConfig => {
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
