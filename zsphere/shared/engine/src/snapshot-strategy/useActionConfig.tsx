import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'virtualization.create' | 'virtualization.enable' | 'virtualization.disable' | 'virtualization.editNameDescription' | 'virtualization.edit' | 'virtualization.delete'

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
        key: 'virtualization.create',
        name: intl.formatMessage({ id: 'create.snapshot.strategy', defaultMessage: 'New Snapshot Policy' }),
        auth: {
          authKey: 'virtualization.create',
          resource: 'snapshot.strategy',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'virtualization.enable',
        name: intl.formatMessage({ id: 'enable.zsv', defaultMessage: 'Enable' }),
        auth: {
          authKey: 'virtualization.enable',
          resource: 'snapshot.strategy',
          type: 'action'
        },
      },
      {
        key: 'virtualization.disable',
        name: intl.formatMessage({ id: 'disable.zsv', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'virtualization.disable',
          resource: 'snapshot.strategy',
          type: 'action'
        },
      },
      {
        key: 'virtualization.editNameDescription',
        name: intl.formatMessage({ id: 'edit.name.and.desc', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'virtualization.editNameDescription',
          resource: 'snapshot.strategy',
          type: 'action'
        },
      },
      {
        key: 'virtualization.edit',
        name: intl.formatMessage({ id: 'edit.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'virtualization.edit',
          resource: 'snapshot.strategy',
          type: 'action'
        },
      },
      {
        key: 'virtualization.delete',
        name: intl.formatMessage({ id: 'delete.zsv', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'virtualization.delete',
          resource: 'snapshot.strategy',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['virtualization.enable', 'virtualization.disable', 'virtualization.editNameDescription', 'virtualization.edit', 'virtualization.delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['virtualization.enable', 'virtualization.disable', 'virtualization.editNameDescription', 'virtualization.edit', 'virtualization.delete'],
      },
      'main/toolbar': {
        extraKeys: ['virtualization.create'],
        activeKeys: ['virtualization.enable', 'virtualization.disable', 'virtualization.delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('snapshot-strategy', intl).then(remoteConfig => {
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
