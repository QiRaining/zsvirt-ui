import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'reconnect.consoleproxy' | 'update.consoleproxy'

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
        key: 'reconnect.consoleproxy',
        name: intl.formatMessage({ id: 'reconnect.consoleproxy', defaultMessage: 'Reconnect' }),
        auth: {
          authKey: 'reconnect.consoleproxy',
          resource: 'console.proxy',
          type: 'action'
        },
      },
      {
        key: 'update.consoleproxy',
        name: intl.formatMessage({ id: 'set.consoleproxy.adress', defaultMessage: 'Set Console Proxy Address' }),
        auth: {
          authKey: 'update.consoleproxy',
          resource: 'console.proxy',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['reconnect.consoleproxy', 'update.consoleproxy'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['reconnect.consoleproxy', 'update.consoleproxy'],
      },
      'main/toolbar': {
        extraKeys: ['reconnect.consoleproxy'],
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
      genActionFromRemote('console-proxy', intl).then(remoteConfig => {
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
