import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'virtualization.create.l2.network' | 'attach.in.baremetal.cluster' | 'detach.in.baremetal.cluster' | 'virtualization.create.l3network' | 'virtualization.edit.nameandDescription' | 'virtualization.set.resource.attribute' | 'virtualization.set.shareType' | 'share.resource' | 'cancel.share' | 'virtualization.attach.cluster' | 'virtualization.detach.cluster' | 'virtualization.delete'

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
        key: 'virtualization.create.l2.network',
        name: intl.formatMessage({ id: 'virtualization.create.l2.network', defaultMessage: 'New Distributed Switch' }),
        auth: {
          authKey: 'virtualization.create.l2.network',
          resource: 'l2.network',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'attach.in.baremetal.cluster',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.in.baremetal.cluster',
          resource: 'l2.network',
          type: 'action'
        },
      },
      {
        key: 'detach.in.baremetal.cluster',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.in.baremetal.cluster',
          resource: 'l2.network',
          type: 'action'
        },
      },
      {
        key: 'virtualization.create.l3network',
        name: intl.formatMessage({ id: 'virtualization.create.l3network', defaultMessage: 'New Distributed Port Group' }),
        auth: {
          authKey: 'virtualization.create.l3network',
          resource: 'flat.network',
          type: 'action'
        },
      },
      {
        key: 'virtualization.create.l3network-divider',
        divider: true,
      },
      {
        key: 'virtualization.edit.nameandDescription',
        name: intl.formatMessage({ id: 'edit.nameandDescription', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'virtualization.edit.nameandDescription',
          resource: 'l2.network',
          type: 'action'
        },
      },
      {
        key: 'virtualization.set.resource.attribute',
        name: intl.formatMessage({ id: 'set.resource.attribute', defaultMessage: 'Set Custom Attribute' }),
        auth: {
          authKey: 'virtualization.set.resource.attribute',
          resource: 'l2.network',
          type: 'action'
        },
      },
      {
        key: 'virtualization.set.resource.attribute-divider',
        divider: true,
      },
      {
        key: 'virtualization.set.shareType',
        name: intl.formatMessage({ id: 'set.shareType', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'virtualization.set.shareType',
          resource: 'l2.network',
          type: 'action'
        },
      },
      {
        key: 'share.resource',
        name: intl.formatMessage({ id: 'share.resource', defaultMessage: 'Share Resource' }),
        auth: {
          authKey: 'share.resource',
          resource: 'l2.network',
          type: 'action'
        },
      },
      {
        key: 'cancel.share',
        name: intl.formatMessage({ id: 'cancel.share', defaultMessage: 'Unshare' }),
        auth: {
          authKey: 'cancel.share',
          resource: 'l2.network',
          type: 'action'
        },
      },
      {
        key: 'virtualization.attach.cluster',
        name: intl.formatMessage({ id: 'add.cluster', defaultMessage: 'Attach Cluster' }),
        auth: {
          authKey: 'virtualization.attach.cluster',
          resource: 'l2.network',
          type: 'action'
        },
      },
      {
        key: 'virtualization.detach.cluster',
        name: intl.formatMessage({ id: 'detach.cluster', defaultMessage: 'Detach Cluster' }),
        auth: {
          authKey: 'virtualization.detach.cluster',
          resource: 'l2.network',
          type: 'action'
        },
      },
      {
        key: 'virtualization.detach.cluster-divider',
        divider: true,
      },
      {
        key: 'virtualization.delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'virtualization.delete',
          resource: 'l2.network',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.share/directory': {
        extraKeys: [],
        activeKeys: ['virtualization.create.l3network'],
      },
      'main.share/header': {
        extraKeys: ['virtualization.create.l3network'],
        activeKeys: [],
      },
      'main.share/row': {
        extraKeys: [],
        activeKeys: ['virtualization.create.l3network'],
      },
      'main.share/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
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
      'sub.baremetal.cluster/row': {
        extraKeys: [],
        activeKeys: ['detach.in.baremetal.cluster'],
      },
      'sub.baremetal.cluster/toolbar': {
        extraKeys: ['virtualization.create.l2.network', 'attach.in.baremetal.cluster', 'detach.in.baremetal.cluster'],
        activeKeys: [],
      },
      'sub.virtualization.cluster/row': {
        extraKeys: [],
        activeKeys: ['virtualization.create.l3network', 'virtualization.edit.nameandDescription', 'virtualization.set.resource.attribute', 'virtualization.set.shareType', 'virtualization.attach.cluster', 'virtualization.detach.cluster', 'virtualization.delete'],
      },
      'sub.virtualization.cluster/toolbar': {
        extraKeys: ['virtualization.create.l2.network'],
        activeKeys: ['virtualization.set.resource.attribute', 'virtualization.set.shareType', 'virtualization.delete'],
      },
      'sub.virtualization.zone/row': {
        extraKeys: [],
        activeKeys: ['virtualization.create.l3network', 'virtualization.edit.nameandDescription', 'virtualization.set.resource.attribute', 'virtualization.set.shareType', 'virtualization.attach.cluster', 'virtualization.detach.cluster', 'virtualization.delete'],
      },
      'sub.virtualization.zone/toolbar': {
        extraKeys: ['virtualization.create.l2.network'],
        activeKeys: ['virtualization.set.resource.attribute', 'virtualization.set.shareType', 'virtualization.delete'],
      },
      'sub.zsv.shared.resource': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.zsv.shared.resource/row': {
        extraKeys: [],
        activeKeys: ['virtualization.create.l3network', 'virtualization.edit.nameandDescription', 'virtualization.set.resource.attribute', 'virtualization.set.shareType', 'cancel.share', 'virtualization.attach.cluster', 'virtualization.detach.cluster', 'virtualization.delete'],
      },
      'sub.zsv.shared.resource/toolbar': {
        extraKeys: ['share.resource', 'cancel.share'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'virtualization.dir.network.resource/dir': {
        extraKeys: [],
        activeKeys: ['virtualization.create.l3network', 'virtualization.edit.nameandDescription', 'virtualization.set.resource.attribute', 'virtualization.set.shareType', 'virtualization.attach.cluster', 'virtualization.detach.cluster', 'virtualization.delete'],
      },
      'virtualization.dir.network.resource/directory': {
        extraKeys: [],
        activeKeys: ['virtualization.create.l3network', 'virtualization.edit.nameandDescription', 'virtualization.set.resource.attribute', 'virtualization.set.shareType', 'virtualization.attach.cluster', 'virtualization.detach.cluster', 'virtualization.delete'],
      },
      'virtualization.dir/directory': {
        extraKeys: [],
        activeKeys: ['virtualization.create.l3network', 'virtualization.edit.nameandDescription', 'virtualization.set.resource.attribute', 'virtualization.set.shareType', 'virtualization.attach.cluster', 'virtualization.detach.cluster', 'virtualization.delete'],
      },
      'virtualization.main/header': {
        extraKeys: [],
        activeKeys: ['virtualization.create.l3network', 'virtualization.edit.nameandDescription', 'virtualization.set.resource.attribute', 'virtualization.set.shareType', 'virtualization.attach.cluster', 'virtualization.detach.cluster', 'virtualization.delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('l2-network', intl).then(remoteConfig => {
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
