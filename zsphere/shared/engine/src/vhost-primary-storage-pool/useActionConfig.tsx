import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'virtualization.add.storagePool' | 'virtualization.set.displayName' | 'virtualization.delete'

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
        key: 'virtualization.add.storagePool',
        name: intl.formatMessage({ id: 'virtualization.add.storagePool', defaultMessage: 'Add Storage Pool' }),
        auth: {
          authKey: 'virtualization.add.storagePool',
          resource: 'vhost.primary.storage.pool',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'virtualization.add.storagePool-divider',
        divider: true,
      },
      {
        key: 'virtualization.set.displayName',
        name: intl.formatMessage({ id: 'virtualization.set.displayName', defaultMessage: 'Set Display Name' }),
        auth: {
          authKey: 'virtualization.set.displayName',
          resource: 'vhost.primary.storage.pool',
          type: 'action'
        },
      },
      {
        key: 'virtualization.delete',
        name: intl.formatMessage({ id: 'virtualization.delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'virtualization.delete',
          resource: 'vhost.primary.storage.pool',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'virtualization.main/row': {
        extraKeys: [],
        activeKeys: ['virtualization.set.displayName', 'virtualization.delete'],
      },
      'virtualization.main/toolbar': {
        extraKeys: ['virtualization.add.storagePool', 'virtualization.delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('vhost-primary-storage-pool', intl).then(remoteConfig => {
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
