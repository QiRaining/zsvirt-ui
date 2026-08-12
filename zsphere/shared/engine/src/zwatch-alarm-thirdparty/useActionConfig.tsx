import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.third.party.alarm' | 'edit' | 'add.endpoint.to.event.alarm' | 'remove.endpoint.from.event.alarm' | 'delete.event.alarm'

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
        key: 'create.third.party.alarm',
        name: intl.formatMessage({ id: 'create.thirdpartyZwatchAlarm', defaultMessage: 'Create Extended Alarm' }),
        auth: {
          authKey: 'create.third.party.alarm',
          resource: 'zwatch.alarm.thirdparty',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'zwatch.alarm.thirdparty',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'add.endpoint.to.event.alarm',
        name: intl.formatMessage({ id: 'add.endpoint', defaultMessage: 'Add Endpoint' }),
        auth: {
          authKey: 'add.endpoint.to.event.alarm',
          resource: 'zwatch.alarm.thirdparty',
          type: 'action'
        },
      },
      {
        key: 'remove.endpoint.from.event.alarm',
        name: intl.formatMessage({ id: 'remove.endpoint', defaultMessage: 'Remove Endpoint' }),
        auth: {
          authKey: 'remove.endpoint.from.event.alarm',
          resource: 'zwatch.alarm.thirdparty',
          type: 'action'
        },
      },
      {
        key: 'delete.event.alarm',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete.event.alarm',
          resource: 'zwatch.alarm.thirdparty',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'add.endpoint.to.event.alarm', 'remove.endpoint.from.event.alarm', 'delete.event.alarm'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'add.endpoint.to.event.alarm', 'remove.endpoint.from.event.alarm', 'delete.event.alarm'],
      },
      'main/toolbar': {
        extraKeys: ['create.third.party.alarm', 'delete.event.alarm'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('zwatch-alarm-thirdparty', intl).then(remoteConfig => {
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
