import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.scheduler.trigger' | 'edit' | 'modify.scheduler.configure' | 'delete'

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
        key: 'create.scheduler.trigger',
        name: intl.formatMessage({ id: 'create.scheduler', defaultMessage: 'Create Scheduler' }),
        auth: {
          authKey: 'create.scheduler.trigger',
          resource: 'scheduler',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'scheduler',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'modify.scheduler.configure',
        name: intl.formatMessage({ id: 'modify.scheduler.configure', defaultMessage: 'Modify Scheduler Configuration' }),
        auth: {
          authKey: 'modify.scheduler.configure',
          resource: 'scheduler',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'scheduler',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main.completed/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'main.completed/row': {
        extraKeys: [],
        activeKeys: ['delete'],
      },
      'main.completed/toolbar': {
        extraKeys: ['delete'],
        activeKeys: [],
      },
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'modify.scheduler.configure', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'modify.scheduler.configure', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.scheduler.trigger', 'delete'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
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
      genActionFromRemote('scheduler', intl).then(remoteConfig => {
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
