import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.reource.alarm' | 'enable' | 'enable.zsv' | 'disable.zsv' | 'disable' | 'edit' | 'edit.zsv' | 'editConfig' | 'add.alarm' | 'remove.alarm' | 'add.endpoint.to.resource.alarm' | 'remove.endpoint.from.resource.alarm' | 'delete.resource.alarm'

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
        key: 'create.reource.alarm',
        name: intl.formatMessage({ id: 'create.resourceAlarm', defaultMessage: 'New Resource Alarm' }),
        auth: {
          authKey: 'create.reource.alarm',
          resource: 'zwatch.alarm.resource',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'zwatch.alarm.resource',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'enable.zsv',
        name: intl.formatMessage({ id: 'enable.zsv', defaultMessage: 'Enable' }),
        auth: {
          authKey: 'enable.zsv',
          resource: 'zwatch.alarm.resource',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable.zsv',
        name: intl.formatMessage({ id: 'disable.zsv', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable.zsv',
          resource: 'zwatch.alarm.resource',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'disable.zsv-divider',
        divider: true,
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'zwatch.alarm.resource',
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
          resource: 'zwatch.alarm.resource',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'edit.zsv',
        name: intl.formatMessage({ id: 'virtualization.edit.name.and.description', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'edit.zsv',
          resource: 'zwatch.alarm.resource',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'editConfig',
        name: intl.formatMessage({ id: 'editConfig', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'editConfig',
          resource: 'zwatch.alarm.resource',
          type: 'action'
        },
      },
      {
        key: 'add.alarm',
        name: intl.formatMessage({ id: 'add.alarm', defaultMessage: 'Add Alarm' }),
        auth: {
          authKey: 'add.alarm',
          resource: 'zwatch.alarm.resource',
          type: 'action'
        },
      },
      {
        key: 'remove.alarm',
        name: intl.formatMessage({ id: 'remove.alarm', defaultMessage: 'Remove Alarm' }),
        auth: {
          authKey: 'remove.alarm',
          resource: 'zwatch.alarm.resource',
          type: 'action'
        },
      },
      {
        key: 'add.endpoint.to.resource.alarm',
        name: intl.formatMessage({ id: 'add.endpoint', defaultMessage: 'Add Endpoint' }),
        auth: {
          authKey: 'add.endpoint.to.resource.alarm',
          resource: 'zwatch.alarm.resource',
          type: 'action'
        },
      },
      {
        key: 'remove.endpoint.from.resource.alarm',
        name: intl.formatMessage({ id: 'remove.endpoint', defaultMessage: 'Remove Endpoint' }),
        auth: {
          authKey: 'remove.endpoint.from.resource.alarm',
          resource: 'zwatch.alarm.resource',
          type: 'action'
        },
      },
      {
        key: 'remove.endpoint.from.resource.alarm-divider',
        divider: true,
      },
      {
        key: 'delete.resource.alarm',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete.resource.alarm',
          resource: 'zwatch.alarm.resource',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main.virtualization/header': {
        extraKeys: [],
        activeKeys: ['enable.zsv', 'disable.zsv', 'edit.zsv', 'editConfig', 'add.endpoint.to.resource.alarm', 'remove.endpoint.from.resource.alarm', 'delete.resource.alarm'],
      },
      'main.virtualization/row': {
        extraKeys: [],
        activeKeys: ['enable.zsv', 'disable.zsv', 'edit.zsv', 'editConfig', 'add.endpoint.to.resource.alarm', 'remove.endpoint.from.resource.alarm', 'delete.resource.alarm'],
      },
      'main.virtualization/toolbar': {
        extraKeys: ['create.reource.alarm', 'enable.zsv', 'disable.zsv', 'delete.resource.alarm'],
        activeKeys: [],
      },
      'main/header': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'edit.zsv', 'editConfig', 'add.endpoint.to.resource.alarm', 'remove.endpoint.from.resource.alarm', 'delete.resource.alarm'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'edit.zsv', 'editConfig', 'add.endpoint.to.resource.alarm', 'remove.endpoint.from.resource.alarm', 'delete.resource.alarm'],
      },
      'main/toolbar': {
        extraKeys: ['create.reource.alarm', 'enable', 'disable', 'delete.resource.alarm'],
        activeKeys: [],
      },
      'sub.backup.storage/row': {
        extraKeys: [],
        activeKeys: ['enable.zsv', 'disable.zsv', 'delete.resource.alarm'],
      },
      'sub.backup.storage/toolbar': {
        extraKeys: ['create.reource.alarm'],
        activeKeys: ['enable.zsv', 'disable.zsv', 'delete.resource.alarm'],
      },
      'sub.baremetal.instance/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'delete.resource.alarm'],
      },
      'sub.baremetal.instance/toolbar': {
        extraKeys: ['create.reource.alarm'],
        activeKeys: ['enable', 'disable', 'delete.resource.alarm'],
      },
      'sub.cdp.task/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'delete.resource.alarm'],
      },
      'sub.cdp.task/toolbar': {
        extraKeys: ['create.reource.alarm'],
        activeKeys: ['enable', 'disable', 'delete.resource.alarm'],
      },
      'sub.host/row': {
        extraKeys: [],
        activeKeys: ['enable.zsv', 'disable.zsv', 'delete.resource.alarm'],
      },
      'sub.host/toolbar': {
        extraKeys: ['create.reource.alarm'],
        activeKeys: ['enable.zsv', 'disable.zsv', 'delete.resource.alarm'],
      },
      'sub.l3.network/row': {
        extraKeys: [],
        activeKeys: ['enable.zsv', 'disable.zsv', 'delete.resource.alarm'],
      },
      'sub.l3.network/toolbar': {
        extraKeys: ['create.reource.alarm'],
        activeKeys: ['enable.zsv', 'disable.zsv', 'delete.resource.alarm'],
      },
      'sub.monitor.group/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'add.endpoint.to.resource.alarm', 'remove.endpoint.from.resource.alarm', 'delete.resource.alarm'],
      },
      'sub.monitor.group/toolbar': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['add.endpoint.to.resource.alarm', 'remove.endpoint.from.resource.alarm', 'delete.resource.alarm'],
      },
      'sub.primary.storage/row': {
        extraKeys: [],
        activeKeys: ['enable.zsv', 'disable.zsv', 'delete.resource.alarm'],
      },
      'sub.primary.storage/toolbar': {
        extraKeys: ['create.reource.alarm'],
        activeKeys: ['enable.zsv', 'disable.zsv', 'delete.resource.alarm'],
      },
      'sub.vip-network/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable'],
      },
      'sub.vip-network/toolbar': {
        extraKeys: ['create.reource.alarm'],
        activeKeys: ['enable', 'disable', 'delete.resource.alarm'],
      },
      'sub.virtualization/row': {
        extraKeys: [],
        activeKeys: ['enable.zsv', 'disable.zsv', 'edit.zsv', 'editConfig', 'add.endpoint.to.resource.alarm', 'remove.endpoint.from.resource.alarm', 'delete.resource.alarm'],
      },
      'sub.virtualization/toolbar': {
        extraKeys: ['create.reource.alarm', 'enable.zsv', 'disable.zsv', 'delete.resource.alarm'],
        activeKeys: [],
      },
      'sub.vm.instance/row': {
        extraKeys: [],
        activeKeys: ['enable.zsv', 'disable.zsv', 'delete.resource.alarm'],
      },
      'sub.vm.instance/toolbar': {
        extraKeys: ['create.reource.alarm'],
        activeKeys: ['enable.zsv', 'disable.zsv', 'delete.resource.alarm'],
      },
      'sub.vpc.vrouter/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'delete.resource.alarm'],
      },
      'sub.vpc.vrouter/toolbar': {
        extraKeys: ['create.reource.alarm'],
        activeKeys: ['enable', 'disable', 'delete.resource.alarm'],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'delete.resource.alarm'],
      },
      'sub/toolbar': {
        extraKeys: ['create.reource.alarm'],
        activeKeys: ['enable', 'disable', 'delete.resource.alarm'],
      },
      'virtualization.main/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'edit.zsv', 'editConfig', 'add.endpoint.to.resource.alarm', 'remove.endpoint.from.resource.alarm', 'delete.resource.alarm'],
      },
      'virtualization.main/toolbar': {
        extraKeys: ['create.reource.alarm', 'enable', 'disable', 'delete.resource.alarm'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('zwatch-alarm-resource', intl).then(remoteConfig => {
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
