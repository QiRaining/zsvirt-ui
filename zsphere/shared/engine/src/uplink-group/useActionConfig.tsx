import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'addNic' | 'removeNic' | 'remove.host.from.bond'

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
        key: 'addNic',
        name: intl.formatMessage({ id: 'add.networkInterface', defaultMessage: 'Add Physical Port' }),
        auth: {
          authKey: 'addNic',
          resource: 'uplink.group',
          type: 'action'
        },
      },
      {
        key: 'removeNic',
        name: intl.formatMessage({ id: 'remove.networkInterface', defaultMessage: 'Remove Physical Port' }),
        auth: {
          authKey: 'removeNic',
          resource: 'uplink.group',
          type: 'action'
        },
      },
      {
        key: 'removeNic-divider',
        divider: true,
      },
      {
        key: 'remove.host.from.bond',
        name: intl.formatMessage({ id: 'virtualization.remove.host.from.vswitch', defaultMessage: 'Disconnect Host Uplink' }),
        auth: {
          authKey: 'remove.host.from.bond',
          resource: 'uplink.group',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/row': {
        extraKeys: [],
        activeKeys: ['addNic', 'removeNic', 'remove.host.from.bond'],
      },
      'main/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('uplink-group', intl).then(remoteConfig => {
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
