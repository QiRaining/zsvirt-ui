import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'revert' | 'retrieve.files' | 'set.protection'

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
        key: 'revert',
        name: intl.formatMessage({ id: 'revert', defaultMessage: 'Revert' }),
        auth: {
          authKey: 'revert',
          resource: 'cdp.data.protected.recovery.points',
          type: 'action'
        },
      },
      {
        key: 'retrieve.files',
        name: intl.formatMessage({ id: 'retrieve.files', defaultMessage: 'Retrieve File' }),
        auth: {
          authKey: 'retrieve.files',
          resource: 'cdp.data.protected.recovery.points',
          type: 'action'
        },
      },
      {
        key: 'set.protection',
        name: intl.formatMessage({ id: 'unlock.protection', defaultMessage: 'Unlock Recovery Point' }),
        auth: {
          authKey: 'set.protection',
          resource: 'cdp.data.protected.recovery.points',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/row': {
        extraKeys: [],
        activeKeys: ['revert', 'retrieve.files', 'set.protection'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('cdp-data-protected-recovery-points', intl).then(remoteConfig => {
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
