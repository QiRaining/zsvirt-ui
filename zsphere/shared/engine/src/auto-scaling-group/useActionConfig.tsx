import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create' | 'edit' | 'enable' | 'disabled' | 'bind.affinityGroup' | 'unbind.affinityGroup' | 'attach.vm.group' | 'detach.vm.group' | 'change.image' | 'delete'

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
        key: 'create',
        name: intl.formatMessage({ id: 'create.autoScalingGroup', defaultMessage: 'Create Auto-Scaling Group' }),
        auth: {
          authKey: 'create',
          resource: 'auto.scaling.group',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'auto.scaling.group',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'auto.scaling.group',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disabled',
        name: intl.formatMessage({ id: 'disabled', defaultMessage: 'Disabled' }),
        auth: {
          authKey: 'disabled',
          resource: 'auto.scaling.group',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'bind.affinityGroup',
        name: intl.formatMessage({ id: 'bind.affinityGroup', defaultMessage: 'Associate Affinity Group' }),
        auth: {
          authKey: 'bind.affinityGroup',
          resource: 'auto.scaling.group',
          type: 'action'
        },
      },
      {
        key: 'unbind.affinityGroup',
        name: intl.formatMessage({ id: 'unbind.affinityGroup', defaultMessage: 'Disassociate Affinity Group' }),
        auth: {
          authKey: 'unbind.affinityGroup',
          resource: 'auto.scaling.group',
          type: 'action'
        },
      },
      {
        key: 'attach.vm.group',
        name: intl.formatMessage({ id: 'attach.vm.group', defaultMessage: 'Add to VM Scheduling Group' }),
        auth: {
          authKey: 'attach.vm.group',
          resource: 'auto.scaling.group',
          type: 'action'
        },
      },
      {
        key: 'detach.vm.group',
        name: intl.formatMessage({ id: 'detach.vm.group', defaultMessage: 'Remove from VM Scheduling Group' }),
        auth: {
          authKey: 'detach.vm.group',
          resource: 'auto.scaling.group',
          type: 'action'
        },
      },
      {
        key: 'change.image',
        name: intl.formatMessage({ id: 'change.image', defaultMessage: 'Change Image' }),
        auth: {
          authKey: 'change.image',
          resource: 'auto.scaling.group',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'auto.scaling.group',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['enable', 'disabled'],
        activeKeys: ['edit', 'attach.vm.group', 'detach.vm.group', 'change.image', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disabled', 'attach.vm.group', 'detach.vm.group', 'change.image', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create', 'enable', 'disabled', 'delete'],
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
      genActionFromRemote('auto-scaling-group', intl).then(remoteConfig => {
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
