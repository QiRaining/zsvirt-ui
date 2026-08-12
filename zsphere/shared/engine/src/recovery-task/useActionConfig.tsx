import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.recoverTask' | 'edit' | 'reExecute' | 'cancelTask' | 'delete'

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
        key: 'create.recoverTask',
        name: intl.formatMessage({ id: 'create.recoverTask', defaultMessage: 'Create Recovery Task' }),
        auth: {
          authKey: 'create.recoverTask',
          resource: 'recovery.task',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'recovery.task',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'reExecute',
        name: intl.formatMessage({ id: 'reExecute', defaultMessage: 'Redo' }),
        auth: {
          authKey: 'reExecute',
          resource: 'recovery.task',
          type: 'action'
        },
      },
      {
        key: 'cancelTask',
        name: intl.formatMessage({ id: 'cancelTask', defaultMessage: 'Cancel Task' }),
        auth: {
          authKey: 'cancelTask',
          resource: 'recovery.task',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'recovery.task',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'reExecute', 'cancelTask', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'reExecute', 'cancelTask', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.recoverTask', 'delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('recovery-task', intl).then(remoteConfig => {
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
