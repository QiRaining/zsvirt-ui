import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'add.data.storage' | 'refresh' | 'virtualization.add.nvmeStorage' | 'virtualization.edit.name' | 'virtualization.sync.data' | 'virtualization.add.data.storage' | 'virtualization.attach.cluster' | 'virtualization.delete'

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
        key: 'add.data.storage',
        name: intl.formatMessage({ id: 'add.data.storage', defaultMessage: 'Add Data Storage' }),
        auth: {
          authKey: 'add.data.storage',
          resource: 'nvme',
          type: 'action'
        },
      },
      {
        key: 'refresh',
        name: intl.formatMessage({ id: 'refresh.fiber.channel.storage', defaultMessage: 'Sync Device Info' }),
        auth: {
          authKey: 'refresh',
          resource: 'nvme',
          type: 'action'
        },
        icon: 'sync',
      },
      {
        key: 'virtualization.add.nvmeStorage',
        name: intl.formatMessage({ id: 'virtualization.add.nvmeStorage', defaultMessage: 'Add NVMe Storage' }),
        auth: {
          authKey: 'virtualization.add.nvmeStorage',
          resource: 'nvme',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'virtualization.edit.name',
        name: intl.formatMessage({ id: 'virtualization.edit.name', defaultMessage: 'Edit Name' }),
        auth: {
          authKey: 'virtualization.edit.name',
          resource: 'nvme',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'virtualization.sync.data',
        name: intl.formatMessage({ id: 'virtualization.sync.data', defaultMessage: 'Sync Data' }),
        auth: {
          authKey: 'virtualization.sync.data',
          resource: 'nvme',
          type: 'action'
        },
      },
      {
        key: 'virtualization.add.data.storage',
        name: intl.formatMessage({ id: 'virtualization.add.data.storage', defaultMessage: 'Add Data Storage' }),
        auth: {
          authKey: 'virtualization.add.data.storage',
          resource: 'nvme',
          type: 'action'
        },
      },
      {
        key: 'virtualization.attach.cluster',
        name: intl.formatMessage({ id: 'virtualization.attach.cluster', defaultMessage: 'Attach Cluster' }),
        auth: {
          authKey: 'virtualization.attach.cluster',
          resource: 'nvme',
          type: 'action'
        },
      },
      {
        key: 'virtualization.attach.cluster-divider',
        divider: true,
      },
      {
        key: 'virtualization.delete',
        name: intl.formatMessage({ id: 'virtualization.delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'virtualization.delete',
          resource: 'nvme',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main': {
        extraKeys: ['refresh'],
        activeKeys: [],
      },
      'sub.virtualization.data.storage/header': {
        extraKeys: [],
        activeKeys: ['virtualization.add.data.storage'],
      },
      'sub.virtualization.zone/header': {
        extraKeys: ['virtualization.edit.name'],
        activeKeys: ['virtualization.sync.data', 'virtualization.add.data.storage', 'virtualization.attach.cluster', 'virtualization.delete'],
      },
      'sub.virtualization.zone/toolbar': {
        extraKeys: ['virtualization.add.nvmeStorage'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('nvme', intl).then(remoteConfig => {
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
