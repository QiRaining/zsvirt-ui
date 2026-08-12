import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.snapshot' | 'create.vm' | 'edit.name.description' | 'revert' | 'delete' | 'start' | 'stop'

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
        key: 'create.snapshot',
        name: intl.formatMessage({ id: 'create.snapshot', defaultMessage: 'Create Snapshot' }),
        auth: {
          authKey: 'create.snapshot',
          resource: 'snapshot',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'create.vm',
        name: intl.formatMessage({ id: 'create.vm', defaultMessage: 'New Virtual Machine' }),
        auth: {
          authKey: 'create.vm',
          resource: 'snapshot',
          type: 'action'
        },
      },
      {
        key: 'edit.name.description',
        name: intl.formatMessage({ id: 'edit.name.description', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'edit.name.description',
          resource: 'snapshot',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'revert',
        name: intl.formatMessage({ id: 'revert', defaultMessage: 'Revert' }),
        auth: {
          authKey: 'revert',
          resource: 'snapshot',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'snapshot',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'start',
        name: intl.formatMessage({ id: 'start', defaultMessage: 'Start' }),
        auth: {
          authKey: 'start',
          resource: 'snapshot',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'stop',
        name: intl.formatMessage({ id: 'stop', defaultMessage: 'Stop' }),
        auth: {
          authKey: 'stop',
          resource: 'snapshot',
          type: 'action'
        },
        icon: 'stop-circle',
      },
    ],

    viewMap: {
      'main.virtualization/header': {
        extraKeys: ['create.vm', 'revert'],
        activeKeys: ['edit.name.description', 'delete'],
      },
      'main.virtualization/row': {
        extraKeys: [],
        activeKeys: ['create.vm', 'edit.name.description', 'revert', 'delete'],
      },
      'main.virtualization/toolbar': {
        extraKeys: ['create.snapshot', 'start', 'stop'],
        activeKeys: [],
      },
      'main/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['create.vm', 'edit.name.description', 'revert', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.snapshot', 'delete'],
        activeKeys: [],
      },
      'sub.baremetal/header': {
        extraKeys: ['revert', 'delete'],
        activeKeys: [],
      },
      'sub.baremetalGroup/row': {
        extraKeys: [],
        activeKeys: ['revert', 'delete'],
      },
      'sub.baremetalSingle/row': {
        extraKeys: [],
        activeKeys: ['revert', 'delete'],
      },
      'sub.group/header': {
        extraKeys: ['revert'],
        activeKeys: ['delete'],
      },
      'sub.group/row': {
        extraKeys: [],
        activeKeys: ['revert', 'delete'],
      },
      'sub.single/header': {
        extraKeys: ['revert', 'delete'],
        activeKeys: [],
      },
      'sub.single/row': {
        extraKeys: [],
        activeKeys: ['revert', 'delete'],
      },
      'sub.virtualization/toolbar': {
        extraKeys: ['create.snapshot'],
        activeKeys: [],
      },
      'sub.vm/header': {
        extraKeys: ['revert', 'delete'],
        activeKeys: [],
      },
      'sub.vmGroup/row': {
        extraKeys: [],
        activeKeys: ['revert', 'delete'],
      },
      'sub.vmSingle/row': {
        extraKeys: [],
        activeKeys: ['revert', 'delete'],
      },
      'sub.volume/header': {
        extraKeys: ['revert', 'delete'],
        activeKeys: [],
      },
      'sub.volumeGroup/row': {
        extraKeys: [],
        activeKeys: ['revert', 'delete'],
      },
      'sub.volumeSingle/row': {
        extraKeys: [],
        activeKeys: ['revert', 'delete'],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['revert', 'delete'],
      },
      'sub/toolbar': {
        extraKeys: ['create.snapshot', 'delete'],
        activeKeys: [],
      },
      'virtualization.dir/directory': {
        extraKeys: [],
        activeKeys: ['create.vm', 'edit.name.description', 'revert', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('snapshot', intl).then(remoteConfig => {
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
