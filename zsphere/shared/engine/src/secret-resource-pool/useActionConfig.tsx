import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.secretResourcePool' | 'edit' | 'set.secretKey' | 'manual.check.sync' | 'set.autoCheck' | 'delete'

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
        key: 'create.secretResourcePool',
        name: intl.formatMessage({ id: 'create.secretResourcePool', defaultMessage: 'Create HSM Pool' }),
        auth: {
          authKey: 'create.secretResourcePool',
          resource: 'secret.resource.pool',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'secret.resource.pool',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'set.secretKey',
        name: intl.formatMessage({ id: 'set.secretKey', defaultMessage: 'Activate' }),
        auth: {
          authKey: 'set.secretKey',
          resource: 'secret.resource.pool',
          type: 'action'
        },
      },
      {
        key: 'manual.check.sync',
        name: intl.formatMessage({ id: 'manual.check.sync', defaultMessage: 'Manually Check Sync' }),
        auth: {
          authKey: 'manual.check.sync',
          resource: 'secret.resource.pool',
          type: 'action'
        },
      },
      {
        key: 'set.autoCheck',
        name: intl.formatMessage({ id: 'set.autocheck', defaultMessage: 'Set HSM Heartbeat Detection Policy' }),
        auth: {
          authKey: 'set.autoCheck',
          resource: 'secret.resource.pool',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'secret.resource.pool',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['set.secretKey'],
        activeKeys: ['edit', 'manual.check.sync', 'set.autoCheck', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'set.secretKey', 'manual.check.sync', 'set.autoCheck', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.secretResourcePool', 'delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('secret-resource-pool', intl).then(remoteConfig => {
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
