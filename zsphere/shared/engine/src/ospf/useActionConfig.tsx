import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.ospf.area' | 'set.share.type' | 'delete'

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
        key: 'create.ospf.area',
        name: intl.formatMessage({ id: 'create.ospfArea', defaultMessage: 'Create OSPF Area' }),
        auth: {
          authKey: 'create.ospf.area',
          resource: 'ospf',
          type: 'action'
        },
      },
      {
        key: 'set.share.type',
        name: intl.formatMessage({ id: 'set.share.type', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'set.share.type',
          resource: 'ospf',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'ospf',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['set.share.type', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['set.share.type', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.ospf.area'],
        activeKeys: ['set.share.type', 'delete'],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['delete'],
      },
      'sub/toolbar': {
        extraKeys: ['delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('ospf', intl).then(remoteConfig => {
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
