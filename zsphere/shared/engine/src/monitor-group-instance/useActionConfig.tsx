import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'add.monitor.group.instance' | 'remove.monitor.group.instance'

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
        key: 'add.monitor.group.instance',
        name: intl.formatMessage({ id: 'add.monitorGroupInstance', defaultMessage: 'Add' }),
        auth: {
          authKey: 'add.monitor.group.instance',
          resource: 'monitor.group.instance',
          type: 'action'
        },
      },
      {
        key: 'remove.monitor.group.instance',
        name: intl.formatMessage({ id: 'remove.monitorGroupInstance', defaultMessage: 'Remove' }),
        auth: {
          authKey: 'remove.monitor.group.instance',
          resource: 'monitor.group.instance',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['add.monitor.group.instance', 'remove.monitor.group.instance'],
        activeKeys: [],
      },
      'main/row': {
        extraKeys: ['remove.monitor.group.instance'],
        activeKeys: [],
      },
      'main/toolbar': {
        extraKeys: ['add.monitor.group.instance', 'remove.monitor.group.instance'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: ['remove.monitor.group.instance'],
        activeKeys: [],
      },
      'sub/toolbar': {
        extraKeys: ['add.monitor.group.instance', 'remove.monitor.group.instance'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('monitor-group-instance', intl).then(remoteConfig => {
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
