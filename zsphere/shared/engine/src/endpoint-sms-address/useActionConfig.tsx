import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'add.endpoint.address' | 'modify.endpoint.address' | 'delete'

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
        key: 'add.endpoint.address',
        name: intl.formatMessage({ id: 'add', defaultMessage: 'Add' }),
        auth: {
          authKey: 'add.endpoint.address',
          resource: 'endpoint.sms.address',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'modify.endpoint.address',
        name: intl.formatMessage({ id: 'endpoint-sms-address.modify.endpoint.address', defaultMessage: 'Modify' }),
        auth: {
          authKey: 'modify.endpoint.address',
          resource: 'endpoint.sms.address',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'endpoint-sms-address.delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'endpoint.sms.address',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main.virtualization/row': {
        extraKeys: [],
        activeKeys: ['modify.endpoint.address', 'delete'],
      },
      'main.virtualization/toolbar': {
        extraKeys: [],
        activeKeys: ['add.endpoint.address'],
      },
      'main/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['modify.endpoint.address', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['add.endpoint.address', 'delete'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['add.endpoint.address', 'modify.endpoint.address', 'delete'],
      },
      'sub/toolbar': {
        extraKeys: ['add.endpoint.address'],
        activeKeys: ['modify.endpoint.address', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('endpoint-sms-address', intl).then(remoteConfig => {
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
