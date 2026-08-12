import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'enable' | 'disable' | 'share' | 'cancel.share'

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
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'baremetal2.chassis.offering',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'baremetal2.chassis.offering',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'share',
        name: intl.formatMessage({ id: 'set.share.mode', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'share',
          resource: 'baremetal2.chassis.offering',
          type: 'action'
        },
        icon: 'share',
      },
      {
        key: 'cancel.share',
        name: intl.formatMessage({ id: 'cancel.share', defaultMessage: 'Unshare' }),
        auth: {
          authKey: 'cancel.share',
          resource: 'baremetal2.chassis.offering',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['share'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'share'],
      },
      'main/toolbar': {
        extraKeys: ['enable', 'disable', 'share'],
        activeKeys: [],
      },
      'sub.shared.resource/row': {
        extraKeys: [],
        activeKeys: ['cancel.share'],
      },
      'sub.shared.resource/toolbar': {
        extraKeys: ['cancel.share'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('baremetal2-chassis-offering', intl).then(remoteConfig => {
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
