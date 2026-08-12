import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'virtualization.enabled' | 'virtualization.closed' | 'close.dynamic.resource.ispatch' | 'stateScan' | 'change.strategy'

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
        key: 'virtualization.enabled',
        name: intl.formatMessage({ id: 'virtualization.open', defaultMessage: 'Enable' }),
        auth: {
          authKey: 'virtualization.enabled',
          resource: 'dynamic.resource.ispatch.strategy',
          type: 'action'
        },
      },
      {
        key: 'virtualization.closed',
        name: intl.formatMessage({ id: 'virtualization.closed', defaultMessage: 'Disabled' }),
        auth: {
          authKey: 'virtualization.closed',
          resource: 'dynamic.resource.ispatch.strategy',
          type: 'action'
        },
      },
      {
        key: 'virtualization.closed-divider',
        divider: true,
      },
      {
        key: 'close.dynamic.resource.ispatch',
        name: intl.formatMessage({ id: 'close.dynamic.resource.ispatch', defaultMessage: 'Disable DRS' }),
        auth: {
          authKey: 'close.dynamic.resource.ispatch',
          resource: 'dynamic.resource.ispatch.strategy',
          type: 'action'
        },
      },
      {
        key: 'close.dynamic.resource.ispatch-divider',
        divider: true,
      },
      {
        key: 'stateScan',
        name: intl.formatMessage({ id: 'stateScan', defaultMessage: 'Scan Status' }),
        auth: {
          authKey: 'stateScan',
          resource: 'dynamic.resource.ispatch.strategy',
          type: 'action'
        },
        icon: 'sync',
      },
      {
        key: 'change.strategy',
        name: intl.formatMessage({ id: 'change.strategy', defaultMessage: 'Modify Policy' }),
        auth: {
          authKey: 'change.strategy',
          resource: 'dynamic.resource.ispatch.strategy',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['virtualization.enabled', 'virtualization.closed', 'stateScan', 'change.strategy'],
      },
      'main/toolbar': {
        extraKeys: ['stateScan'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('dynamic-resource-ispatch-strategy', intl).then(remoteConfig => {
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
