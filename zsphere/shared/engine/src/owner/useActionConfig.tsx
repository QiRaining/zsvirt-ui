import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'share' | 'revoke' | 'set.share.type'

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
        key: 'share',
        name: intl.formatMessage({ id: 'share', defaultMessage: 'Share' }),
        auth: {
          authKey: 'share',
          resource: 'owner',
          type: 'action'
        },
      },
      {
        key: 'revoke',
        name: intl.formatMessage({ id: 'revoke', defaultMessage: 'Recall' }),
        auth: {
          authKey: 'revoke',
          resource: 'owner',
          type: 'action'
        },
      },
      {
        key: 'set.share.type',
        name: intl.formatMessage({ id: 'set.share.type', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'set.share.type',
          resource: 'owner',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'sub/toolbar': {
        extraKeys: ['share', 'revoke'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('owner', intl).then(remoteConfig => {
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
