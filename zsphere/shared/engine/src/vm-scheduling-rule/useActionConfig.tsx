import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.vmSchedulingRule' | 'edit' | 'enable' | 'disable' | 'modify.config' | 'modify.excuteMode' | 'delete'

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
        key: 'create.vmSchedulingRule',
        name: intl.formatMessage({ id: 'create.vmSchedulingRule', defaultMessage: 'New VM Scheduling Policy' }),
        auth: {
          authKey: 'create.vmSchedulingRule',
          resource: 'vm.scheduling.rule',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'vm.scheduling.rule',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'vm.scheduling.rule',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'vm.scheduling.rule',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'modify.config',
        name: intl.formatMessage({ id: ' virtualization.modifyConfig', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'modify.config',
          resource: 'vm.scheduling.rule',
          type: 'action'
        },
      },
      {
        key: 'modify.excuteMode',
        name: intl.formatMessage({ id: 'modify.excuteMode', defaultMessage: 'Change Execution Mechanism' }),
        auth: {
          authKey: 'modify.excuteMode',
          resource: 'vm.scheduling.rule',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'vm.scheduling.rule',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'modify.excuteMode', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'modify.excuteMode', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.vmSchedulingRule', 'enable', 'disable', 'delete'],
        activeKeys: [],
      },
      'sub.host-group/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'modify.excuteMode'],
      },
      'sub.host-group/toolbar': {
        extraKeys: ['enable', 'disable'],
        activeKeys: [],
      },
      'sub.virtualization.host-group/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'modify.config', 'delete'],
      },
      'sub.virtualization.host-group/toolbar': {
        extraKeys: ['enable', 'disable'],
        activeKeys: [],
      },
      'sub.virtualization.vm-group/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'modify.config', 'delete'],
      },
      'sub.virtualization.vm-group/toolbar': {
        extraKeys: ['enable', 'disable'],
        activeKeys: [],
      },
      'sub.vm-group/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'modify.excuteMode'],
      },
      'sub.vm-group/toolbar': {
        extraKeys: ['enable', 'disable'],
        activeKeys: [],
      },
      'virtualization.main/header': {
        extraKeys: ['enable', 'disable', 'modify.config'],
        activeKeys: ['edit', 'delete'],
      },
      'virtualization.main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'modify.config', 'delete'],
      },
      'virtualization.main/toolbar': {
        extraKeys: ['create.vmSchedulingRule', 'enable', 'disable', 'delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('vm-scheduling-rule', intl).then(remoteConfig => {
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
