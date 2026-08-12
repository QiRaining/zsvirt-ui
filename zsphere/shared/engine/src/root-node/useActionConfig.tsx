import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create' | 'settings'

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
        key: 'create',
        name: intl.formatMessage({ id: 'virtualization.create.zone', defaultMessage: 'New Data Center' }),
        auth: {
          authKey: 'create',
          resource: 'zone',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'settings',
        name: intl.formatMessage({ id: 'settings', defaultMessage: 'Settings' }),
        auth: {
          authKey: 'settings',
          resource: 'root.node',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'virtualization.dir/directory': {
        extraKeys: [],
        activeKeys: ['create', 'settings'],
      },
      'virtualization.main/header': {
        extraKeys: [],
        activeKeys: ['create', 'settings'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('root-node', intl).then(remoteConfig => {
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
