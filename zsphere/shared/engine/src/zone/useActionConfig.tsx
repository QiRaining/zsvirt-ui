import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'virtualization.create.cluster' | 'virtualization.create.baremetal.clsuter' | 'virtualization.add.dataStore' | 'virtualization.add.imageStore' | 'virtualization.create.l2network' | 'virtualization.create.instance.group' | 'edit' | 'create.zone' | 'delete' | 'load' | 'uninstall'

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
        key: 'virtualization.create.cluster',
        name: intl.formatMessage({ id: 'virtualization.create.cluster', defaultMessage: 'New Cluster' }),
        auth: {
          authKey: 'virtualization.create.cluster',
          resource: 'zone',
          type: 'action'
        },
      },
      {
        key: 'virtualization.create.baremetal.clsuter',
        name: intl.formatMessage({ id: 'create.baremetal.clsuter', defaultMessage: 'New Bare Metal Cluster' }),
        auth: {
          authKey: 'virtualization.create.baremetal.clsuter',
          resource: 'zone',
          type: 'action'
        },
      },
      {
        key: 'virtualization.add.dataStore',
        name: intl.formatMessage({ id: 'virtualization.add.dataStore', defaultMessage: 'Add Data Storage' }),
        auth: {
          authKey: 'virtualization.add.dataStore',
          resource: 'zone',
          type: 'action'
        },
      },
      {
        key: 'virtualization.add.imageStore',
        name: intl.formatMessage({ id: 'virtualization.add.imageStore', defaultMessage: 'Add Image Storage' }),
        auth: {
          authKey: 'virtualization.add.imageStore',
          resource: 'zone',
          type: 'action'
        },
      },
      {
        key: 'virtualization.create.l2network',
        name: intl.formatMessage({ id: 'virtualization.create.l2network', defaultMessage: 'New Distributed Switch' }),
        auth: {
          authKey: 'virtualization.create.l2network',
          resource: 'l2network',
          type: 'action'
        },
      },
      {
        key: 'virtualization.create.instance.group',
        name: intl.formatMessage({ id: 'virtualization.create.instance.group', defaultMessage: 'New VM Group' }),
        auth: {
          authKey: 'virtualization.create.instance.group',
          resource: 'zone',
          type: 'action'
        },
      },
      {
        key: 'virtualization.create.instance.group-divider',
        divider: true,
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'zone',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'edit-divider',
        divider: true,
      },
      {
        key: 'create.zone',
        name: intl.formatMessage({ id: 'create.zone', defaultMessage: 'New Data Center' }),
        auth: {
          authKey: 'create.zone',
          resource: 'zone',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'zone',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'load',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'load',
          resource: 'zone',
          type: 'action'
        },
      },
      {
        key: 'uninstall',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'uninstall',
          resource: 'zone',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.zone', 'delete'],
        activeKeys: [],
      },
      'sub.remoteserver/row': {
        extraKeys: [],
        activeKeys: ['uninstall'],
      },
      'sub.remoteserver/toolbar': {
        extraKeys: ['load', 'uninstall'],
        activeKeys: [],
      },
      'sub.rootNode/row': {
        extraKeys: [],
        activeKeys: ['virtualization.create.cluster', 'virtualization.create.baremetal.clsuter', 'virtualization.add.dataStore', 'virtualization.add.imageStore', 'virtualization.create.l2network', 'virtualization.create.instance.group', 'edit', 'delete'],
      },
      'sub.rootNode/toolbar': {
        extraKeys: ['create.zone'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['delete'],
      },
      'sub/toolbar': {
        extraKeys: [],
        activeKeys: ['delete'],
      },
      'virtualization.dir.network.resource/dir': {
        extraKeys: [],
        activeKeys: ['virtualization.create.cluster', 'virtualization.add.dataStore', 'virtualization.add.imageStore', 'virtualization.create.l2network', 'virtualization.create.instance.group', 'edit', 'delete'],
      },
      'virtualization.dir.network.resource/directory': {
        extraKeys: [],
        activeKeys: ['virtualization.create.cluster', 'virtualization.add.dataStore', 'virtualization.add.imageStore', 'virtualization.create.l2network', 'virtualization.create.instance.group', 'edit', 'delete'],
      },
      'virtualization.dir.template.image/dir': {
        extraKeys: [],
        activeKeys: ['virtualization.create.cluster', 'virtualization.add.dataStore', 'virtualization.add.imageStore', 'virtualization.create.l2network', 'virtualization.create.instance.group', 'edit', 'delete'],
      },
      'virtualization.dir.template.image/directory': {
        extraKeys: [],
        activeKeys: ['virtualization.create.cluster', 'virtualization.add.dataStore', 'virtualization.add.imageStore', 'virtualization.create.l2network', 'virtualization.create.instance.group', 'edit', 'delete'],
      },
      'virtualization.dir/directory': {
        extraKeys: [],
        activeKeys: ['virtualization.create.cluster', 'virtualization.create.baremetal.clsuter', 'virtualization.add.dataStore', 'virtualization.add.imageStore', 'virtualization.create.l2network', 'virtualization.create.instance.group', 'edit', 'delete'],
      },
      'virtualization.dir/header': {
        extraKeys: [],
        activeKeys: ['virtualization.create.cluster', 'virtualization.add.dataStore', 'virtualization.add.imageStore', 'virtualization.create.l2network', 'virtualization.create.instance.group', 'edit', 'delete'],
      },
      'virtualization.main/header': {
        extraKeys: [],
        activeKeys: ['virtualization.create.cluster', 'virtualization.create.baremetal.clsuter', 'virtualization.add.dataStore', 'virtualization.add.imageStore', 'virtualization.create.l2network', 'virtualization.create.instance.group', 'edit', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('zone', intl).then(remoteConfig => {
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
