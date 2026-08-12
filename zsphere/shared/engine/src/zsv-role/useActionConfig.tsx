import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.role' | 'virtualization.edit.config' | 'clone.role' | 'virtualization.delete'

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
        key: 'create.role',
        name: intl.formatMessage({ id: 'create.role', defaultMessage: 'New Role' }),
        auth: {
          authKey: 'create.role',
          resource: 'zsv.role',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'virtualization.edit.config',
        name: intl.formatMessage({ id: 'virtualization.edit.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'virtualization.edit.config',
          resource: 'zsv.role',
          type: 'action'
        },
      },
      {
        key: 'clone.role',
        name: intl.formatMessage({ id: 'clone.role', defaultMessage: 'Clone Role' }),
        auth: {
          authKey: 'clone.role',
          resource: 'zsv.role',
          type: 'action'
        },
      },
      {
        key: 'clone.role-divider',
        divider: true,
      },
      {
        key: 'virtualization.delete',
        name: intl.formatMessage({ id: 'virtualization.delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'virtualization.delete',
          resource: 'zsv.role',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'virtualization.main/header': {
        extraKeys: [],
        activeKeys: ['virtualization.edit.config', 'clone.role', 'virtualization.delete'],
      },
      'virtualization.main/row': {
        extraKeys: [],
        activeKeys: ['virtualization.edit.config', 'clone.role', 'virtualization.delete'],
      },
      'virtualization.main/toolbar': {
        extraKeys: ['create.role', 'virtualization.delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('zsv-role', intl).then(remoteConfig => {
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
