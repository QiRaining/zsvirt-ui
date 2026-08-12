import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'mark.as.readed.single' | 'all.mark.read' | 'handle.message' | 'recover.alarm'

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
        key: 'mark.as.readed.single',
        name: intl.formatMessage({ id: 'alarm.message.mark.as.confirmed', defaultMessage: 'Acknowledge' }),
        auth: {
          authKey: 'mark.as.readed.single',
          resource: 'alarm.platform.message',
          type: 'action'
        },
      },
      {
        key: 'all.mark.read',
        name: intl.formatMessage({ id: 'all.markRead', defaultMessage: 'Mark All as Read' }),
        auth: {
          authKey: 'all.mark.read',
          resource: 'alarm.platform.message',
          type: 'action'
        },
      },
      {
        key: 'handle.message',
        name: intl.formatMessage({ id: 'handle.message', defaultMessage: 'Set Silence Period' }),
        auth: {
          authKey: 'handle.message',
          resource: 'alarm.platform.message',
          type: 'action'
        },
      },
      {
        key: 'recover.alarm',
        name: intl.formatMessage({ id: 'recover.alarm', defaultMessage: 'Restore Alarm' }),
        auth: {
          authKey: 'recover.alarm',
          resource: 'alarm.platform.message',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.unread/row': {
        extraKeys: [],
        activeKeys: ['mark.as.readed.single', 'handle.message', 'recover.alarm'],
      },
      'main.unread/toolbar': {
        extraKeys: ['mark.as.readed.single'],
        activeKeys: ['all.mark.read', 'recover.alarm'],
      },
      'main/header': {
        extraKeys: [],
        activeKeys: ['mark.as.readed.single', 'handle.message', 'recover.alarm'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['mark.as.readed.single', 'handle.message', 'recover.alarm'],
      },
      'main/toolbar': {
        extraKeys: ['mark.as.readed.single'],
        activeKeys: ['all.mark.read', 'recover.alarm'],
      },
      'sub.global.alert': {
        extraKeys: [],
        activeKeys: ['all.mark.read', 'handle.message', 'recover.alarm'],
      },
      'sub.global.alert/row': {
        extraKeys: [],
        activeKeys: ['handle.message', 'recover.alarm'],
      },
      'sub.monitor.group/row': {
        extraKeys: [],
        activeKeys: ['handle.message', 'recover.alarm'],
      },
      'sub.monitor.group/toolbar': {
        extraKeys: ['recover.alarm'],
        activeKeys: [],
      },
      'sub.virtualization/row': {
        extraKeys: [],
        activeKeys: ['mark.as.readed.single', 'handle.message', 'recover.alarm'],
      },
      'sub.virtualization/toolbar': {
        extraKeys: ['mark.as.readed.single', 'recover.alarm'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['handle.message', 'recover.alarm'],
      },
      'sub/toolbar': {
        extraKeys: ['recover.alarm'],
        activeKeys: [],
      },
      'virtualization.global.list/row': {
        extraKeys: [],
        activeKeys: ['mark.as.readed.single', 'handle.message', 'recover.alarm'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('alarm-platform-message', intl).then(remoteConfig => {
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
