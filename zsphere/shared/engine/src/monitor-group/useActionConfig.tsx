import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.monitor.group' | 'edit' | 'set.rule.template' | 'sync.monitorTemplate' | 'attach.tag' | 'detach.tag' | 'attach.monitor.group' | 'detach.monitor.group' | 'attach.resource.tag' | 'detach' | 'delete'

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
        key: 'create.monitor.group',
        name: intl.formatMessage({ id: 'create.monitorGroup', defaultMessage: 'Create Resource Group' }),
        auth: {
          authKey: 'create.monitor.group',
          resource: 'monitor.group',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'monitor.group',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'set.rule.template',
        name: intl.formatMessage({ id: 'set.monitorTemplate', defaultMessage: 'Set Alarm Template' }),
        auth: {
          authKey: 'set.rule.template',
          resource: 'monitor.group',
          type: 'action'
        },
      },
      {
        key: 'sync.monitorTemplate',
        name: intl.formatMessage({ id: 'sync.monitorTemplate', defaultMessage: 'Sync Rules from Alarm Template' }),
        auth: {
          authKey: 'sync.monitorTemplate',
          resource: 'monitor.group',
          type: 'action'
        },
      },
      {
        key: 'attach.tag',
        name: intl.formatMessage({ id: 'attach.tag', defaultMessage: 'Attach Tag' }),
        auth: {
          authKey: 'attach.tag',
          resource: 'monitor.group',
          type: 'action'
        },
      },
      {
        key: 'detach.tag',
        name: intl.formatMessage({ id: 'detach.tag', defaultMessage: 'Detach Tag' }),
        auth: {
          authKey: 'detach.tag',
          resource: 'monitor.group',
          type: 'action'
        },
      },
      {
        key: 'attach.monitor.group',
        name: intl.formatMessage({ id: 'associate.monitorGroup', defaultMessage: 'Attach Resource Group' }),
        auth: {
          authKey: 'attach.monitor.group',
          resource: 'monitor.group',
          type: 'action'
        },
      },
      {
        key: 'detach.monitor.group',
        name: intl.formatMessage({ id: 'disassociate.monitorGroup', defaultMessage: 'Detach Resource Group' }),
        auth: {
          authKey: 'detach.monitor.group',
          resource: 'monitor.group',
          type: 'action'
        },
      },
      {
        key: 'attach.resource.tag',
        name: intl.formatMessage({ id: 'bind', defaultMessage: 'Associate' }),
        auth: {
          authKey: 'attach.resource.tag',
          resource: 'monitor.group',
          type: 'action'
        },
      },
      {
        key: 'detach',
        name: intl.formatMessage({ id: 'disassociate', defaultMessage: 'Disassociate' }),
        auth: {
          authKey: 'detach',
          resource: 'monitor.group',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'monitor.group',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'set.rule.template', 'sync.monitorTemplate', 'attach.tag', 'detach.tag', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'set.rule.template', 'sync.monitorTemplate', 'attach.tag', 'detach.tag', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.monitor.group'],
        activeKeys: ['set.rule.template', 'sync.monitorTemplate', 'attach.tag', 'delete'],
      },
      'sub.monitor.template/row': {
        extraKeys: [],
        activeKeys: ['detach.monitor.group'],
      },
      'sub.monitor.template/toolbar': {
        extraKeys: ['attach.monitor.group', 'detach.monitor.group'],
        activeKeys: [],
      },
      'sub.monitorGroup.tag/row': {
        extraKeys: [],
        activeKeys: ['detach'],
      },
      'sub.monitorGroup.tag/toolbar': {
        extraKeys: ['attach.resource.tag', 'detach'],
        activeKeys: [],
      },
      'sub.tag/row': {
        extraKeys: [],
        activeKeys: ['detach'],
      },
      'sub.tag/toolbar': {
        extraKeys: ['detach'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['attach.tag', 'detach.tag', 'delete'],
      },
      'sub/toolbar': {
        extraKeys: ['create.monitor.group'],
        activeKeys: ['set.rule.template', 'sync.monitorTemplate', 'attach.tag', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('monitor-group', intl).then(remoteConfig => {
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
