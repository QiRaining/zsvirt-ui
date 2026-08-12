import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.zwatchEndpoint' | 'enable' | 'disable' | 'edit' | 'edit.zsv' | 'editConfig' | 'add.alarm' | 'remove.alarm' | 'remove.endpoint.in.resource.row' | 'remove.endpoint.in.event.row' | 'test.message' | 'send.testMsg' | 'delete' | 'add.in.alarm.resource' | 'remove.in.alarm.resource' | 'add.in.alarm.event' | 'remove.in.alarm.event' | 'add.in.alarm.third.party' | 'remove.in.alarm.third.party' | 'add.in.monitor.group' | 'remove.in.monitor.group'

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
        key: 'create.zwatchEndpoint',
        name: intl.formatMessage({ id: 'create.zwatchEndpoint', defaultMessage: 'New Endpoint' }),
        auth: {
          authKey: 'create.zwatchEndpoint',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'disable-divider',
        divider: true,
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'edit.zsv',
        name: intl.formatMessage({ id: 'virtualization.edit.name.and.description', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'edit.zsv',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'editConfig',
        name: intl.formatMessage({ id: 'editConfig', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'editConfig',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
      },
      {
        key: 'add.alarm',
        name: intl.formatMessage({ id: 'add.alarm', defaultMessage: 'Add Alarm' }),
        auth: {
          authKey: 'add.alarm',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
      },
      {
        key: 'remove.alarm',
        name: intl.formatMessage({ id: 'remove.alarm', defaultMessage: 'Remove Alarm' }),
        auth: {
          authKey: 'remove.alarm',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
      },
      {
        key: 'remove.endpoint.in.resource.row',
        name: intl.formatMessage({ id: 'remove.endpoint', defaultMessage: 'Remove Endpoint' }),
        auth: {
          authKey: 'remove.endpoint.in.resource.row',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
      },
      {
        key: 'remove.endpoint.in.event.row',
        name: intl.formatMessage({ id: 'remove.endpoint', defaultMessage: 'Remove Endpoint' }),
        auth: {
          authKey: 'remove.endpoint.in.event.row',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
      },
      {
        key: 'test.message',
        name: intl.formatMessage({ id: 'test.message', defaultMessage: 'Test Text Message' }),
        auth: {
          authKey: 'test.message',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
      },
      {
        key: 'send.testMsg',
        name: intl.formatMessage({ id: 'send.testMsg', defaultMessage: 'Send Test Message' }),
        auth: {
          authKey: 'send.testMsg',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
      },
      {
        key: 'send.testMsg-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'add.in.alarm.resource',
        name: intl.formatMessage({ id: 'add', defaultMessage: 'Add' }),
        auth: {
          authKey: 'add.in.alarm.resource',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
      },
      {
        key: 'remove.in.alarm.resource',
        name: intl.formatMessage({ id: 'remove', defaultMessage: 'Remove' }),
        auth: {
          authKey: 'remove.in.alarm.resource',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
      },
      {
        key: 'add.in.alarm.event',
        name: intl.formatMessage({ id: 'add', defaultMessage: 'Add' }),
        auth: {
          authKey: 'add.in.alarm.event',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
      },
      {
        key: 'remove.in.alarm.event',
        name: intl.formatMessage({ id: 'remove', defaultMessage: 'Remove' }),
        auth: {
          authKey: 'remove.in.alarm.event',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
      },
      {
        key: 'add.in.alarm.third.party',
        name: intl.formatMessage({ id: 'add.zwatchEndpoint', defaultMessage: 'Add Endpoint' }),
        auth: {
          authKey: 'add.in.alarm.third.party',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
      },
      {
        key: 'remove.in.alarm.third.party',
        name: intl.formatMessage({ id: 'remove.zwatchEndpoint', defaultMessage: 'Remove Endpoint' }),
        auth: {
          authKey: 'remove.in.alarm.third.party',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
      },
      {
        key: 'add.in.monitor.group',
        name: intl.formatMessage({ id: 'add.zwatchEndpoint', defaultMessage: 'Add Endpoint' }),
        auth: {
          authKey: 'add.in.monitor.group',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
      },
      {
        key: 'remove.in.monitor.group',
        name: intl.formatMessage({ id: 'remove.zwatchEndpoint', defaultMessage: 'Remove Endpoint' }),
        auth: {
          authKey: 'remove.in.monitor.group',
          resource: 'zwatch.endpoint',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.virtualization/header': {
        extraKeys: ['enable', 'disable'],
        activeKeys: [],
      },
      'main.virtualization/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'edit.zsv', 'editConfig', 'add.alarm', 'remove.alarm', 'test.message', 'send.testMsg', 'delete'],
      },
      'main.virtualization/toolbar': {
        extraKeys: ['create.zwatchEndpoint', 'enable', 'disable', 'delete'],
        activeKeys: [],
      },
      'main/header': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'edit.zsv', 'editConfig', 'add.alarm', 'remove.alarm', 'test.message', 'send.testMsg', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'edit.zsv', 'editConfig', 'add.alarm', 'remove.alarm', 'test.message', 'send.testMsg', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.zwatchEndpoint', 'enable', 'disable'],
        activeKeys: ['delete'],
      },
      'sub.alarm.event/row': {
        extraKeys: [],
        activeKeys: ['remove.in.alarm.event'],
      },
      'sub.alarm.event/toolbar': {
        extraKeys: ['add.in.alarm.event', 'remove.in.alarm.event'],
        activeKeys: [],
      },
      'sub.alarm.resource/row': {
        extraKeys: [],
        activeKeys: ['remove.in.alarm.resource'],
      },
      'sub.alarm.resource/toolbar': {
        extraKeys: ['add.in.alarm.resource', 'remove.in.alarm.resource'],
        activeKeys: [],
      },
      'sub.alarm.third.party/row': {
        extraKeys: [],
        activeKeys: ['remove.in.alarm.third.party'],
      },
      'sub.alarm.third.party/toolbar': {
        extraKeys: ['add.in.alarm.third.party', 'remove.in.alarm.third.party'],
        activeKeys: [],
      },
      'sub.monitor.group/row': {
        extraKeys: [],
        activeKeys: ['remove.in.monitor.group'],
      },
      'sub.monitor.group/toolbar': {
        extraKeys: ['add.in.monitor.group', 'remove.in.monitor.group'],
        activeKeys: [],
      },
      'sub.virtualization.event/row': {
        extraKeys: [],
        activeKeys: ['edit.zsv', 'editConfig', 'remove.endpoint.in.event.row', 'delete'],
      },
      'sub.virtualization.event/toolbar': {
        extraKeys: ['add.in.alarm.event', 'remove.in.alarm.event'],
        activeKeys: [],
      },
      'sub.virtualization.resource/row': {
        extraKeys: [],
        activeKeys: ['edit.zsv', 'editConfig', 'remove.endpoint.in.resource.row', 'delete'],
      },
      'sub.virtualization.resource/toolbar': {
        extraKeys: ['add.in.alarm.resource', 'remove.in.alarm.resource'],
        activeKeys: [],
      },
      'sub.virtualization/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'edit.zsv', 'editConfig', 'add.alarm', 'remove.alarm', 'test.message', 'send.testMsg', 'delete'],
      },
      'sub.virtualization/toolbar': {
        extraKeys: ['create.zwatchEndpoint', 'enable', 'disable', 'delete'],
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
      genActionFromRemote('zwatch-endpoint', intl).then(remoteConfig => {
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
