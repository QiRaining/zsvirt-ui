import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'edit' | 'restart' | 'delete' | 'create.v2v.migration.job'

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
          resource: 'v2v.migration',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'restart',
        name: intl.formatMessage({ id: 'restart', defaultMessage: 'Reboot' }),
        auth: {
          authKey: 'restart',
          resource: 'v2v.migration',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'v2v.migration',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'create.v2v.migration.job',
        name: intl.formatMessage({ id: 'create.v2vMigration', defaultMessage: 'Create V2V Task' }),
        auth: {
          authKey: 'create.v2v.migration.job',
          resource: 'v2v.migration',
          type: 'action'
        },
        icon: 'plus',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'restart', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'restart', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.v2v.migration.job'],
        activeKeys: ['restart', 'delete'],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['restart', 'delete'],
      },
      'sub/toolbar': {
        extraKeys: [],
        activeKeys: ['restart', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('v2v-migration', intl).then(remoteConfig => {
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
