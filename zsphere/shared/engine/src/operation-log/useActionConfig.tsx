import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'cancelTask' | 'suspend' | 'goingOn'

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
        key: 'cancelTask',
        name: intl.formatMessage({ id: 'cancel.task', defaultMessage: 'Cancel Task' }),
        auth: {
          authKey: 'cancelTask',
          resource: 'operation.log',
          type: 'action'
        },
      },
      {
        key: 'suspend',
        name: intl.formatMessage({ id: 'pause', defaultMessage: 'Pause' }),
        auth: {
          authKey: 'suspend',
          resource: 'operation.log',
          type: 'action'
        },
      },
      {
        key: 'goingOn',
        name: intl.formatMessage({ id: 'going.on', defaultMessage: 'Continue' }),
        auth: {
          authKey: 'goingOn',
          resource: 'operation.log',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.global/row': {
        extraKeys: [],
        activeKeys: ['cancelTask', 'suspend', 'goingOn'],
      },
      'sub.current': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.current/row': {
        extraKeys: [],
        activeKeys: ['cancelTask', 'suspend', 'goingOn'],
      },
      'sub.current/toolbar': {
        extraKeys: [],
        activeKeys: ['cancelTask', 'suspend', 'goingOn'],
      },
      'virtualization.main/row': {
        extraKeys: [],
        activeKeys: ['cancelTask', 'suspend', 'goingOn'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('operation-log', intl).then(remoteConfig => {
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
