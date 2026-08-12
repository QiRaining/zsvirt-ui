import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.cdptask' | 'edit.cdptask' | 'enable.cdptask' | 'disable.cdptask' | 'modify.protection.policy' | 'modify.running.policy' | 'delete.cdptask'

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
        key: 'create.cdptask',
        name: intl.formatMessage({ id: 'create.cdptask', defaultMessage: 'Create CDP Task' }),
        auth: {
          authKey: 'create.cdptask',
          resource: 'cdp.task',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit.cdptask',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit.cdptask',
          resource: 'cdp.task',
          type: 'action'
        },
      },
      {
        key: 'enable.cdptask',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable.cdptask',
          resource: 'cdp.task',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable.cdptask',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable.cdptask',
          resource: 'cdp.task',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'modify.protection.policy',
        name: intl.formatMessage({ id: 'modify.protection.policy', defaultMessage: 'Modify Protection Policy' }),
        auth: {
          authKey: 'modify.protection.policy',
          resource: 'cdp.task',
          type: 'action'
        },
      },
      {
        key: 'modify.running.policy',
        name: intl.formatMessage({ id: 'modify.running.policy', defaultMessage: 'Modify Task Running Policy' }),
        auth: {
          authKey: 'modify.running.policy',
          resource: 'cdp.task',
          type: 'action'
        },
      },
      {
        key: 'delete.cdptask',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete.cdptask',
          resource: 'cdp.task',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['enable.cdptask', 'disable.cdptask'],
        activeKeys: ['edit.cdptask', 'modify.protection.policy', 'modify.running.policy', 'delete.cdptask'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit.cdptask', 'enable.cdptask', 'disable.cdptask', 'modify.protection.policy', 'modify.running.policy', 'delete.cdptask'],
      },
      'main/toolbar': {
        extraKeys: ['create.cdptask', 'enable.cdptask', 'disable.cdptask'],
        activeKeys: ['delete.cdptask'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('cdp-task', intl).then(remoteConfig => {
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
