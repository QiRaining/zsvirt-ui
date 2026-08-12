import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'virtualization.create.sub.directory' | 'virtualization.create.vm' | 'edit' | 'delete'

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
        key: 'virtualization.create.sub.directory',
        name: intl.formatMessage({ id: 'create.sub.directory', defaultMessage: 'Creat Sub-Group' }),
        auth: {
          authKey: 'virtualization.create.sub.directory',
          resource: 'vm.dir.group',
          type: 'action'
        },
      },
      {
        key: 'virtualization.create.vm',
        name: intl.formatMessage({ id: 'create.vm', defaultMessage: 'New Virtual Machine' }),
        auth: {
          authKey: 'virtualization.create.vm',
          resource: 'vm.dir.group',
          type: 'action'
        },
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit.name', defaultMessage: 'Edit Name' }),
        auth: {
          authKey: 'edit',
          resource: 'vm.dir.group',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'vm.dir.group',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'virtualization.dir/directory': {
        extraKeys: [],
        activeKeys: ['virtualization.create.sub.directory', 'virtualization.create.vm', 'edit', 'delete'],
      },
      'virtualization.dir/header': {
        extraKeys: [],
        activeKeys: ['virtualization.create.sub.directory', 'virtualization.create.vm', 'edit', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('vm-dir-group', intl).then(remoteConfig => {
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
