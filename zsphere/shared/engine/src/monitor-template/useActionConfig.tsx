import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.monitor.template' | 'edit' | 'clone' | 'set.share.type' | 'attach.tag' | 'detach.tag' | 'attach.monitor.group' | 'detach.monitor.group' | 'modify.alarmRule' | 'sync.rule.to.group' | 'delete' | 'attach.resource.tag' | 'detach'

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
        key: 'create.monitor.template',
        name: intl.formatMessage({ id: 'create.monitorTemplate', defaultMessage: 'Create Alarm Template' }),
        auth: {
          authKey: 'create.monitor.template',
          resource: 'monitor.template',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'monitor.template',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'clone',
        name: intl.formatMessage({ id: 'clone', defaultMessage: 'Clone' }),
        auth: {
          authKey: 'clone',
          resource: 'monitor.template',
          type: 'action'
        },
      },
      {
        key: 'clone-divider',
        divider: true,
      },
      {
        key: 'set.share.type',
        name: intl.formatMessage({ id: 'set.shareType', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'set.share.type',
          resource: 'monitor.template',
          type: 'action'
        },
      },
      {
        key: 'set.share.type-divider',
        divider: true,
      },
      {
        key: 'attach.tag',
        name: intl.formatMessage({ id: 'attach.tag', defaultMessage: 'Attach Tag' }),
        auth: {
          authKey: 'attach.tag',
          resource: 'monitor.template',
          type: 'action'
        },
      },
      {
        key: 'detach.tag',
        name: intl.formatMessage({ id: 'detach.tag', defaultMessage: 'Detach Tag' }),
        auth: {
          authKey: 'detach.tag',
          resource: 'monitor.template',
          type: 'action'
        },
      },
      {
        key: 'attach.monitor.group',
        name: intl.formatMessage({ id: 'associate.MonitorGroup', defaultMessage: 'Attach Resource Group' }),
        auth: {
          authKey: 'attach.monitor.group',
          resource: 'monitor.template',
          type: 'action'
        },
      },
      {
        key: 'detach.monitor.group',
        name: intl.formatMessage({ id: 'disassociate.monitorGroup', defaultMessage: 'Detach Resource Group' }),
        auth: {
          authKey: 'detach.monitor.group',
          resource: 'monitor.template',
          type: 'action'
        },
      },
      {
        key: 'detach.monitor.group-divider',
        divider: true,
      },
      {
        key: 'modify.alarmRule',
        name: intl.formatMessage({ id: 'modify.alarmRule', defaultMessage: 'Modify Alarm Rules' }),
        auth: {
          authKey: 'modify.alarmRule',
          resource: 'monitor.template',
          type: 'action'
        },
      },
      {
        key: 'sync.rule.to.group',
        name: intl.formatMessage({ id: 'sync.rule.to.group', defaultMessage: 'Sync Rules to Resource Group' }),
        auth: {
          authKey: 'sync.rule.to.group',
          resource: 'monitor.template',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'monitor.template',
          type: 'action'
        },
      },
      {
        key: 'attach.resource.tag',
        name: intl.formatMessage({ id: 'bind', defaultMessage: 'Associate' }),
        auth: {
          authKey: 'attach.resource.tag',
          resource: 'monitor.template',
          type: 'action'
        },
      },
      {
        key: 'detach',
        name: intl.formatMessage({ id: 'disassociate', defaultMessage: 'Disassociate' }),
        auth: {
          authKey: 'detach',
          resource: 'monitor.template',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'clone', 'set.share.type', 'attach.tag', 'detach.tag', 'attach.monitor.group', 'detach.monitor.group', 'modify.alarmRule', 'sync.rule.to.group', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'clone', 'set.share.type', 'attach.tag', 'detach.tag', 'attach.monitor.group', 'detach.monitor.group', 'modify.alarmRule', 'sync.rule.to.group', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.monitor.template'],
        activeKeys: ['set.share.type', 'attach.tag', 'delete'],
      },
      'sub.monitorTemplate.tag/row': {
        extraKeys: [],
        activeKeys: ['detach'],
      },
      'sub.monitorTemplate.tag/toolbar': {
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
      genActionFromRemote('monitor-template', intl).then(remoteConfig => {
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
