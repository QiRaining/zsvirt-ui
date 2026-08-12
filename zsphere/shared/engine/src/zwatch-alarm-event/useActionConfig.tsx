import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'enable' | 'disable' | 'add.endpoint.to.event.alarm' | 'remove.endpoint.from.event.alarm' | 'create.event.alarm' | 'editConfig' | 'create.zsv' | 'enable.zsv' | 'disable.zsv' | 'modifyconfig.zsv' | 'add.endpoint.zsv' | 'remove.endpoint.zsv' | 'delete.event.alarm' | 'delete.zsv'

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
          resource: 'zwatch.alarm.event',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'zwatch.alarm.event',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'disable-divider',
        divider: true,
      },
      {
        key: 'add.endpoint.to.event.alarm',
        name: intl.formatMessage({ id: 'add.endpoint', defaultMessage: 'Add Endpoint' }),
        auth: {
          authKey: 'add.endpoint.to.event.alarm',
          resource: 'zwatch.alarm.event',
          type: 'action'
        },
      },
      {
        key: 'remove.endpoint.from.event.alarm',
        name: intl.formatMessage({ id: 'remove.endpoint', defaultMessage: 'Remove Endpoint' }),
        auth: {
          authKey: 'remove.endpoint.from.event.alarm',
          resource: 'zwatch.alarm.event',
          type: 'action'
        },
      },
      {
        key: 'remove.endpoint.from.event.alarm-divider',
        divider: true,
      },
      {
        key: 'create.event.alarm',
        name: intl.formatMessage({ id: 'create.eventAlarm', defaultMessage: 'New Event Alarm' }),
        auth: {
          authKey: 'create.event.alarm',
          resource: 'zwatch.alarm.event',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'editConfig',
        name: intl.formatMessage({ id: 'virtualization.modifyConfig', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'editConfig',
          resource: 'zwatch.alarm.event',
          type: 'action'
        },
      },
      {
        key: 'create.zsv',
        name: intl.formatMessage({ id: 'create.zsv', defaultMessage: 'New Event Alarm' }),
        auth: {
          authKey: 'create.zsv',
          resource: 'zwatch.alarm.event',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'enable.zsv',
        name: intl.formatMessage({ id: 'enable.zsv', defaultMessage: 'Enable' }),
        auth: {
          authKey: 'enable.zsv',
          resource: 'zwatch.alarm.event',
          type: 'action'
        },
      },
      {
        key: 'disable.zsv',
        name: intl.formatMessage({ id: 'disable.zsv', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable.zsv',
          resource: 'zwatch.alarm.event',
          type: 'action'
        },
      },
      {
        key: 'disable.zsv-divider',
        divider: true,
      },
      {
        key: 'modifyconfig.zsv',
        name: intl.formatMessage({ id: 'modifyconfig.zsv', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'modifyconfig.zsv',
          resource: 'zwatch.alarm.event',
          type: 'action'
        },
      },
      {
        key: 'add.endpoint.zsv',
        name: intl.formatMessage({ id: 'add.endpoint.zsv', defaultMessage: 'Add Endpoint' }),
        auth: {
          authKey: 'add.endpoint.zsv',
          resource: 'zwatch.alarm.event',
          type: 'action'
        },
      },
      {
        key: 'remove.endpoint.zsv',
        name: intl.formatMessage({ id: 'remove.endpoint.zsv', defaultMessage: 'Remove Endpoint' }),
        auth: {
          authKey: 'remove.endpoint.zsv',
          resource: 'zwatch.alarm.event',
          type: 'action'
        },
      },
      {
        key: 'remove.endpoint.zsv-divider',
        divider: true,
      },
      {
        key: 'delete.event.alarm',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete.event.alarm',
          resource: 'zwatch.alarm.event',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'delete.zsv',
        name: intl.formatMessage({ id: 'delete.zsv', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete.zsv',
          resource: 'zwatch.alarm.event',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main.virtualization/header': {
        extraKeys: [],
        activeKeys: ['enable.zsv', 'disable.zsv', 'modifyconfig.zsv', 'add.endpoint.zsv', 'remove.endpoint.zsv', 'delete.zsv'],
      },
      'main.virtualization/row': {
        extraKeys: [],
        activeKeys: ['enable.zsv', 'disable.zsv', 'modifyconfig.zsv', 'add.endpoint.zsv', 'remove.endpoint.zsv', 'delete.zsv'],
      },
      'main.virtualization/toolbar': {
        extraKeys: ['create.zsv', 'enable.zsv', 'disable.zsv', 'delete.zsv'],
        activeKeys: [],
      },
      'main/header': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'add.endpoint.to.event.alarm', 'remove.endpoint.from.event.alarm', 'editConfig', 'delete.event.alarm'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'add.endpoint.to.event.alarm', 'remove.endpoint.from.event.alarm', 'enable.zsv', 'disable.zsv', 'add.endpoint.zsv', 'remove.endpoint.zsv', 'delete.event.alarm', 'delete.zsv'],
      },
      'main/toolbar': {
        extraKeys: ['enable', 'disable', 'create.event.alarm', 'enable.zsv', 'disable.zsv', 'delete.event.alarm', 'delete.zsv'],
        activeKeys: [],
      },
      'sub.monitor.group/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'add.endpoint.to.event.alarm', 'remove.endpoint.from.event.alarm', 'delete.event.alarm'],
      },
      'sub.monitor.group/toolbar': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['add.endpoint.to.event.alarm', 'remove.endpoint.from.event.alarm', 'delete.event.alarm'],
      },
      'sub.virtualization/row': {
        extraKeys: [],
        activeKeys: ['enable.zsv', 'disable.zsv', 'modifyconfig.zsv', 'add.endpoint.zsv', 'remove.endpoint.zsv', 'delete.zsv'],
      },
      'sub.virtualization/toolbar': {
        extraKeys: ['create.zsv', 'enable.zsv', 'disable.zsv', 'delete.zsv'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'add.endpoint.to.event.alarm', 'remove.endpoint.from.event.alarm', 'delete.event.alarm'],
      },
      'sub/toolbar': {
        extraKeys: ['create.event.alarm'],
        activeKeys: ['enable', 'disable', 'add.endpoint.to.event.alarm', 'remove.endpoint.from.event.alarm', 'delete.event.alarm'],
      },
      'virtualization.main/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'add.endpoint.to.event.alarm', 'remove.endpoint.from.event.alarm', 'editConfig', 'delete.event.alarm'],
      },
      'virtualization.main/toolbar': {
        extraKeys: ['enable', 'disable', 'create.event.alarm'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('zwatch-alarm-event', intl).then(remoteConfig => {
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
