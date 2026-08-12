import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'primary.storage.cleanup' | 'backup.storage.cleanup'

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
        key: 'primary.storage.cleanup',
        name: intl.formatMessage({ id: 'cleanup', defaultMessage: 'Cleanup' }),
        auth: {
          authKey: 'primary.storage.cleanup',
          resource: 'primary.storage',
          type: 'action'
        },
        icon: 'clean',
      },
      {
        key: 'backup.storage.cleanup',
        name: intl.formatMessage({ id: 'cleanup', defaultMessage: 'Cleanup' }),
        auth: {
          authKey: 'backup.storage.cleanup',
          resource: 'backup.storage',
          type: 'action'
        },
        icon: 'clean',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.backup.storage/row': {
        extraKeys: [],
        activeKeys: ['backup.storage.cleanup'],
      },
      'sub.backup.storage/toolbar': {
        extraKeys: ['backup.storage.cleanup'],
        activeKeys: [],
      },
      'sub.primary.storage/row': {
        extraKeys: [],
        activeKeys: ['primary.storage.cleanup'],
      },
      'sub.primary.storage/toolbar': {
        extraKeys: ['primary.storage.cleanup'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('trash', intl).then(remoteConfig => {
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
