import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'addScript' | 'edit' | 'editScript' | 'execScript' | 'delete'

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
        key: 'addScript',
        name: intl.formatMessage({ id: 'addScript', defaultMessage: 'Create Script' }),
        auth: {
          authKey: 'addScript',
          resource: 'vmscript',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'vmscript',
          type: 'action'
        },
      },
      {
        key: 'editScript',
        name: intl.formatMessage({ id: 'editScript', defaultMessage: 'Modify Script' }),
        auth: {
          authKey: 'editScript',
          resource: 'vmscript',
          type: 'action'
        },
      },
      {
        key: 'execScript',
        name: intl.formatMessage({ id: 'execScript', defaultMessage: 'Execute Script' }),
        auth: {
          authKey: 'execScript',
          resource: 'vmscript',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'vmscript',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/toolbar': {
        extraKeys: ['addScript', 'delete'],
        activeKeys: ['edit', 'editScript', 'execScript'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('vmscript', intl).then(remoteConfig => {
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
