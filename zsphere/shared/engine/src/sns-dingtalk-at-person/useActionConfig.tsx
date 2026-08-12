import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'add.notify.person' | 'update.notify.person' | 'delete.notify.person'

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
        key: 'add.notify.person',
        name: intl.formatMessage({ id: 'add.notify.person', defaultMessage: 'Add' }),
        auth: {
          authKey: 'add.notify.person',
          resource: 'sns.dingtalk.at.person',
          type: 'action'
        },
      },
      {
        key: 'update.notify.person',
        name: intl.formatMessage({ id: 'update.notify.person', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'update.notify.person',
          resource: 'sns.dingtalk.at.person',
          type: 'action'
        },
      },
      {
        key: 'delete.notify.person',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete.notify.person',
          resource: 'sns.dingtalk.at.person',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'sub.notify.person/row': {
        extraKeys: [],
        activeKeys: ['update.notify.person', 'delete.notify.person'],
      },
      'sub.notify.person/toolbar': {
        extraKeys: ['add.notify.person', 'delete.notify.person'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('sns-dingtalk-at-person', intl).then(remoteConfig => {
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
