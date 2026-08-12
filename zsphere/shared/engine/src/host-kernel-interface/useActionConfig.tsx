import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'virtualization.zskernel.create' | 'virtualization.zskernel.edit.config' | 'virtualization.zskernel.edit.nameAndDescription' | 'virtualization.zskernel.delete'

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
        key: 'virtualization.zskernel.create',
        name: intl.formatMessage({ id: 'virtualization.zskernel.create', defaultMessage: 'New Kernel Adapter' }),
        auth: {
          authKey: 'virtualization.zskernel.create',
          resource: 'host.kernel.interface',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'virtualization.zskernel.edit.config',
        name: intl.formatMessage({ id: 'virtualization.zskernel.edit.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'virtualization.zskernel.edit.config',
          resource: 'host.kernel.interface',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'virtualization.zskernel.edit.nameAndDescription',
        name: intl.formatMessage({ id: 'virtualization.zskernel.edit.nameAndDescription', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'virtualization.zskernel.edit.nameAndDescription',
          resource: 'host.kernel.interface',
          type: 'action'
        },
      },
      {
        key: 'virtualization.zskernel.edit.nameAndDescription-divider',
        divider: true,
      },
      {
        key: 'virtualization.zskernel.delete',
        name: intl.formatMessage({ id: 'virtualization.zskernel.delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'virtualization.zskernel.delete',
          resource: 'host.kernel.interface',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['virtualization.zskernel.edit.config'],
        activeKeys: ['virtualization.zskernel.edit.nameAndDescription', 'virtualization.zskernel.delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['virtualization.zskernel.edit.config', 'virtualization.zskernel.edit.nameAndDescription', 'virtualization.zskernel.delete'],
      },
      'main/toolbar': {
        extraKeys: ['virtualization.zskernel.create', 'virtualization.zskernel.delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('host-kernel-interface', intl).then(remoteConfig => {
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
