import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'virtualization.create.vm.spec' | 'virtualization.edit.name.desc' | 'virtualization.edit.config' | 'virtualization.delete'

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
        key: 'virtualization.create.vm.spec',
        name: intl.formatMessage({ id: 'create.vm.spec', defaultMessage: 'New VM Specification' }),
        auth: {
          authKey: 'virtualization.create.vm.spec',
          resource: 'vm.spec',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'virtualization.edit.name.desc',
        name: intl.formatMessage({ id: 'edit.name.and.desc', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'virtualization.edit.name.desc',
          resource: 'vm.spec',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'virtualization.edit.config',
        name: intl.formatMessage({ id: 'edit.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'virtualization.edit.config',
          resource: 'vm.spec',
          type: 'action'
        },
      },
      {
        key: 'virtualization.edit.config-divider',
        divider: true,
      },
      {
        key: 'virtualization.delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'virtualization.delete',
          resource: 'vm.spec',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['virtualization.edit.name.desc'],
        activeKeys: ['virtualization.edit.config', 'virtualization.delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['virtualization.edit.name.desc', 'virtualization.edit.config', 'virtualization.delete'],
      },
      'main/toolbar': {
        extraKeys: ['virtualization.create.vm.spec', 'virtualization.delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('vm-spec', intl).then(remoteConfig => {
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
