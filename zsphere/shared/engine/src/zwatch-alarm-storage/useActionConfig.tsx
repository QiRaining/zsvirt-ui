import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'refetch' | 'virtualization.enable' | 'virtualization.disable' | 'virtualization.edit.config'

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
        key: 'refetch',
        name: intl.formatMessage({ id: 'refetch', defaultMessage: 'Refresh' }),
        auth: {
          authKey: 'refetch',
          resource: 'zwatch.alarm.storage',
          type: 'action'
        },
      },
      {
        key: 'virtualization.enable',
        name: intl.formatMessage({ id: 'virtualization.enable', defaultMessage: 'Enable' }),
        auth: {
          authKey: 'virtualization.enable',
          resource: 'zwatch.alarm.storage',
          type: 'action'
        },
        icon: 'play-circle-fill',
      },
      {
        key: 'virtualization.disable',
        name: intl.formatMessage({ id: 'virtualization.disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'virtualization.disable',
          resource: 'zwatch.alarm.storage',
          type: 'action'
        },
        icon: 'stop-circle-fill',
      },
      {
        key: 'virtualization.edit.config',
        name: intl.formatMessage({ id: 'virtualization.edit.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'virtualization.edit.config',
          resource: 'zwatch.alarm.storage',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'virtualization.main/header': {
        extraKeys: ['refetch', 'virtualization.enable', 'virtualization.disable', 'virtualization.edit.config'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('zwatch-alarm-storage', intl).then(remoteConfig => {
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
