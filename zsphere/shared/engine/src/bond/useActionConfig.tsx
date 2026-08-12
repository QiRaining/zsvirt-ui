import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'edit' | 'edit.description' | 'modify' | 'create' | 'addNic' | 'removeNic' | 'set.physicalNetwork.type' | 'add.physical.nic' | 'remove.physical.nic' | 'delete' | 'remove.host.from.bond' | 'add.host.to.bond'

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
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'bond',
          type: 'action'
        },
      },
      {
        key: 'edit.description',
        name: intl.formatMessage({ id: 'edit.description', defaultMessage: 'Edit Description' }),
        auth: {
          authKey: 'edit.description',
          resource: 'bond',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'modify',
        name: intl.formatMessage({ id: 'update.bond', defaultMessage: 'Modify Bond' }),
        auth: {
          authKey: 'modify',
          resource: 'bond',
          type: 'action'
        },
      },
      {
        key: 'create',
        name: intl.formatMessage({ id: 'add.bond', defaultMessage: 'Add Bond' }),
        auth: {
          authKey: 'create',
          resource: 'bond',
          type: 'action'
        },
      },
      {
        key: 'addNic',
        name: intl.formatMessage({ id: 'add.networkInterface', defaultMessage: 'Add Physical Port' }),
        auth: {
          authKey: 'addNic',
          resource: 'bond',
          type: 'action'
        },
      },
      {
        key: 'removeNic',
        name: intl.formatMessage({ id: 'remove.networkInterface', defaultMessage: 'Remove Physical Port' }),
        auth: {
          authKey: 'removeNic',
          resource: 'bond',
          type: 'action'
        },
      },
      {
        key: 'removeNic-divider',
        divider: true,
      },
      {
        key: 'set.physicalNetwork.type',
        name: intl.formatMessage({ id: 'set.physicalNetwork.type', defaultMessage: 'Modify Network Type' }),
        auth: {
          authKey: 'set.physicalNetwork.type',
          resource: 'bond',
          type: 'action'
        },
      },
      {
        key: 'add.physical.nic',
        name: intl.formatMessage({ id: 'add.physical.nic', defaultMessage: 'Add Physical Port' }),
        auth: {
          authKey: 'add.physical.nic',
          resource: 'bond',
          type: 'action'
        },
      },
      {
        key: 'remove.physical.nic',
        name: intl.formatMessage({ id: 'remove.physical.nic', defaultMessage: 'Remove Physical Port' }),
        auth: {
          authKey: 'remove.physical.nic',
          resource: 'bond',
          type: 'action'
        },
      },
      {
        key: 'remove.physical.nic-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete.bond', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'bond',
          type: 'action'
        },
      },
      {
        key: 'remove.host.from.bond',
        name: intl.formatMessage({ id: 'virtualization.remove.host.from.vswitch', defaultMessage: 'Disconnect Host Uplink' }),
        auth: {
          authKey: 'remove.host.from.bond',
          resource: 'bond',
          type: 'action'
        },
      },
      {
        key: 'add.host.to.bond',
        name: intl.formatMessage({ id: 'add.to.bond', defaultMessage: 'Join Uplink' }),
        auth: {
          authKey: 'add.host.to.bond',
          resource: 'bond',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'sub.bond.in.vswitch/row': {
        extraKeys: [],
        activeKeys: ['add.physical.nic', 'remove.physical.nic', 'remove.host.from.bond'],
      },
      'sub.bond.in.vswitch/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.bond.not.in.vswitch/row': {
        extraKeys: [],
        activeKeys: ['add.host.to.bond'],
      },
      'sub.host.virtualization.bond/header': {
        extraKeys: ['edit.description'],
        activeKeys: ['addNic', 'removeNic'],
      },
      'sub.host.virtualization/header': {
        extraKeys: ['edit.description'],
        activeKeys: ['addNic', 'removeNic', 'delete'],
      },
      'sub.host.virtualization/row': {
        extraKeys: [],
        activeKeys: ['edit.description', 'addNic', 'removeNic', 'delete'],
      },
      'sub.host.virtualization/toolbar': {
        extraKeys: ['delete'],
        activeKeys: [],
      },
      'sub.physicalNetwork/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.physicalNetwork/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.host/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.host/row': {
        extraKeys: [],
        activeKeys: ['edit.description'],
      },
      'sub.virtualization.host/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('bond', intl).then(remoteConfig => {
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
