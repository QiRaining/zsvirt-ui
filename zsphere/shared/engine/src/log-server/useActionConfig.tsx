import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'edit' | 'create.logServer' | 'test' | 'delete'

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
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'log.server',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'create.logServer',
        name: intl.formatMessage({ id: 'add.logServer', defaultMessage: 'Add Log Server' }),
        auth: {
          authKey: 'create.logServer',
          resource: 'log.server',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'test',
        name: intl.formatMessage({ id: 'test.connect', defaultMessage: 'Test Connection' }),
        auth: {
          authKey: 'test',
          resource: 'log.server',
          type: 'action'
        },
        icon: 'link',
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'log.server',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.virtualization/header': {
        extraKeys: ['edit', 'test'],
        activeKeys: ['delete'],
      },
      'main.virtualization/row': {
        extraKeys: [],
        activeKeys: ['edit', 'test', 'delete'],
      },
      'main.virtualization/toolbar': {
        extraKeys: ['create.logServer'],
        activeKeys: ['test', 'delete'],
      },
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'test', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'test', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.logServer'],
        activeKeys: ['test', 'delete'],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['edit', 'test', 'delete'],
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
      genActionFromRemote('log-server', intl).then(remoteConfig => {
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
