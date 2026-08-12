import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create' | 'edit' | 'recover' | 'delete'

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
        name: intl.formatMessage({ id: 'block.snapshot.create', defaultMessage: 'Create Snapshot' }),
        auth: {
          authKey: 'create',
          resource: 'block.snapshot',
          type: 'action'
        },
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'block.snapshot.edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'block.snapshot',
          type: 'action'
        },
      },
      {
        key: 'recover',
        name: intl.formatMessage({ id: 'block.snapshot.recover', defaultMessage: 'Revert' }),
        auth: {
          authKey: 'recover',
          resource: 'block.snapshot',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'block.snapshot.delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'block.snapshot',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'recover', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create', 'delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('block-snapshot', intl).then(remoteConfig => {
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
