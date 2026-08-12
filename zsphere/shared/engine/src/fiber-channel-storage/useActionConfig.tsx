import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'add.data.storage' | 'refresh.fiber.channel.storage'

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
        key: 'add.data.storage',
        name: intl.formatMessage({ id: 'add.data.storage', defaultMessage: 'Add Data Storage' }),
        auth: {
          authKey: 'add.data.storage',
          resource: 'fiber.channel.storage',
          type: 'action'
        },
      },
      {
        key: 'refresh.fiber.channel.storage',
        name: intl.formatMessage({ id: 'synchronize.device.information', defaultMessage: 'Sync Device Info' }),
        auth: {
          authKey: 'refresh.fiber.channel.storage',
          resource: 'fiber.channel.storage',
          type: 'action'
        },
        icon: 'sync',
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
        extraKeys: ['refresh.fiber.channel.storage'],
        activeKeys: [],
      },
      'sub.virtualization.data.storage/header': {
        extraKeys: [],
        activeKeys: ['add.data.storage'],
      },
      'sub.virtualization.zone/toolbar': {
        extraKeys: ['refresh.fiber.channel.storage'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('fiber-channel-storage', intl).then(remoteConfig => {
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
