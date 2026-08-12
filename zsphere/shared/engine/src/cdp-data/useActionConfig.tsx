import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'enable.cdp.task' | 'disable.cdp.task' | 'recover.cdp.data' | 'clear.cdp.data'

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
        key: 'enable.cdp.task',
        name: intl.formatMessage({ id: 'enable.cdptask', defaultMessage: 'Enable CDP Task' }),
        auth: {
          authKey: 'enable.cdp.task',
          resource: 'cdp.data',
          type: 'action'
        },
      },
      {
        key: 'disable.cdp.task',
        name: intl.formatMessage({ id: 'disable.cdptask', defaultMessage: 'Disable CDP Task' }),
        auth: {
          authKey: 'disable.cdp.task',
          resource: 'cdp.data',
          type: 'action'
        },
      },
      {
        key: 'recover.cdp.data',
        name: intl.formatMessage({ id: 'recover.cdp.data', defaultMessage: 'Restore Data' }),
        auth: {
          authKey: 'recover.cdp.data',
          resource: 'cdp.data',
          type: 'action'
        },
        icon: 'refresh',
      },
      {
        key: 'clear.cdp.data',
        name: intl.formatMessage({ id: 'clearData', defaultMessage: 'Clear Data' }),
        auth: {
          authKey: 'clear.cdp.data',
          resource: 'cdp.data',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'detail/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/header': {
        extraKeys: [],
        activeKeys: ['enable.cdp.task', 'disable.cdp.task', 'clear.cdp.data'],
      },
      'main/toolbar': {
        extraKeys: ['recover.cdp.data', 'clear.cdp.data'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('cdp-data', intl).then(remoteConfig => {
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
