import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'virtualization.add.storagePool' | 'add.pool' | 'set.displayName' | 'delete.dataVolumePool' | 'virtualization.delete.pool' | 'attach.in.alarm' | 'detach.in.alarm'

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
        key: 'virtualization.add.storagePool',
        name: intl.formatMessage({ id: 'virtualization.add.storagePool', defaultMessage: 'Add Storage Pool' }),
        auth: {
          authKey: 'virtualization.add.storagePool',
          resource: 'ceph.primary.storage.pool',
          type: 'action'
        },
      },
      {
        key: 'add.pool',
        name: intl.formatMessage({ id: 'add.storagePool', defaultMessage: 'Add Storage Pool' }),
        auth: {
          authKey: 'add.pool',
          resource: 'ceph.primary.storage.pool',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'set.displayName',
        name: intl.formatMessage({ id: 'set.displayName', defaultMessage: 'Set Display Name' }),
        auth: {
          authKey: 'set.displayName',
          resource: 'ceph.primary.storage.pool',
          type: 'action'
        },
      },
      {
        key: 'delete.dataVolumePool',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete.dataVolumePool',
          resource: 'ceph.primary.storage.pool',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'virtualization.delete.pool',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'virtualization.delete.pool',
          resource: 'ceph.primary.storage.pool',
          type: 'action'
        },
      },
      {
        key: 'attach.in.alarm',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.in.alarm',
          resource: 'ceph.primary.storage.pool',
          type: 'action'
        },
      },
      {
        key: 'detach.in.alarm',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.in.alarm',
          resource: 'ceph.primary.storage.pool',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.alarm/row': {
        extraKeys: [],
        activeKeys: ['detach.in.alarm'],
      },
      'sub.alarm/toolbar': {
        extraKeys: ['attach.in.alarm', 'detach.in.alarm'],
        activeKeys: [],
      },
      'sub.primary.storage/row': {
        extraKeys: [],
        activeKeys: ['set.displayName', 'delete.dataVolumePool'],
      },
      'sub.primary.storage/toolbar': {
        extraKeys: ['add.pool', 'delete.dataVolumePool'],
        activeKeys: [],
      },
      'sub.virtualization.primary.storage/row': {
        extraKeys: [],
        activeKeys: ['set.displayName', 'virtualization.delete.pool'],
      },
      'sub.virtualization.primary.storage/toolbar': {
        extraKeys: ['virtualization.add.storagePool', 'virtualization.delete.pool'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('ceph-primary-storage-pool', intl).then(remoteConfig => {
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
