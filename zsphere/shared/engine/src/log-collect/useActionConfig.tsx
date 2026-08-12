import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'collect.log' | 'delete.all.log' | 'download' | 'delete'

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
        key: 'collect.log',
        name: intl.formatMessage({ id: 'collect.log', defaultMessage: 'Collect Log' }),
        auth: {
          authKey: 'collect.log',
          resource: 'log.collect',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'delete.all.log',
        name: intl.formatMessage({ id: 'delete.all.log', defaultMessage: 'Delete All Logs' }),
        auth: {
          authKey: 'delete.all.log',
          resource: 'log.collect',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'download',
        name: intl.formatMessage({ id: 'download', defaultMessage: 'Download' }),
        auth: {
          authKey: 'download',
          resource: 'log.collect',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'log.collect',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'virtualization.main/card': {
        extraKeys: ['download', 'delete'],
        activeKeys: [],
      },
      'virtualization.main/header': {
        extraKeys: ['collect.log'],
        activeKeys: [],
      },
      'virtualization.main/toolbar': {
        extraKeys: ['collect.log', 'delete.all.log'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('log-collect', intl).then(remoteConfig => {
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
