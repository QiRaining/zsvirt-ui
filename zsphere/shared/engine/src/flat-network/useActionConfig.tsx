import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'virtualization.create' | 'virtualization.add.ipv4.range' | 'virtualization.add.ipv6.ipRange' | 'virtualization.add.dns' | 'virtualization.create.hostKernelInterface' | 'virtualization.edit.name.and.description' | 'virtualization.edit.config' | 'virtualization.set.resource.attribute' | 'virtualization.set.shareType' | 'share.resource' | 'cancel.share' | 'virtualization.delete'

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
        name: intl.formatMessage({ id: 'newCreate', defaultMessage: 'New Distributed Port Group' }),
        auth: {
          authKey: 'virtualization.create',
          resource: 'flat.network',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'virtualization.add.ipv4.range',
        name: intl.formatMessage({ id: 'add.Ipv4NetworkRange', defaultMessage: 'Add IPv4 Range' }),
        auth: {
          authKey: 'virtualization.add.ipv4.range',
          resource: 'flat.network',
          type: 'action'
        },
      },
      {
        key: 'virtualization.add.ipv6.ipRange',
        name: intl.formatMessage({ id: 'add.ipv6NetworkRange', defaultMessage: 'Add Pv6 Range' }),
        auth: {
          authKey: 'virtualization.add.ipv6.ipRange',
          resource: 'flat.network',
          type: 'action'
        },
      },
      {
        key: 'virtualization.add.dns',
        name: intl.formatMessage({ id: 'add.dns', defaultMessage: 'Add DNS' }),
        auth: {
          authKey: 'virtualization.add.dns',
          resource: 'flat.network',
          type: 'action'
        },
      },
      {
        key: 'virtualization.create.hostKernelInterface',
        name: intl.formatMessage({ id: 'virtualization.create.hostKernelInterface', defaultMessage: 'New Kernel Adapter' }),
        auth: {
          authKey: 'virtualization.create.hostKernelInterface',
          resource: 'flat.network',
          type: 'action'
        },
      },
      {
        key: 'virtualization.create.hostKernelInterface-divider',
        divider: true,
      },
      {
        key: 'virtualization.edit.name.and.description',
        name: intl.formatMessage({ id: 'edit.name.and.description', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'virtualization.edit.name.and.description',
          resource: 'flat.network',
          type: 'action'
        },
      },
      {
        key: 'virtualization.edit.config',
        name: intl.formatMessage({ id: 'edit.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'virtualization.edit.config',
          resource: 'flat.network',
          type: 'action'
        },
      },
      {
        key: 'virtualization.set.resource.attribute',
        name: intl.formatMessage({ id: 'set.resource.attribute', defaultMessage: 'Set Custom Attribute' }),
        auth: {
          authKey: 'virtualization.set.resource.attribute',
          resource: 'flat.network',
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
          resource: 'flat.network',
          type: 'action'
        },
      },
      {
        key: 'virtualization.set.shareType-divider',
        divider: true,
      },
      {
        key: 'share.resource',
        name: intl.formatMessage({ id: 'share.resource', defaultMessage: 'Share Resource' }),
        auth: {
          authKey: 'share.resource',
          resource: 'flat.network',
          type: 'action'
        },
      },
      {
        key: 'cancel.share',
        name: intl.formatMessage({ id: 'cancel.share', defaultMessage: 'Unshare' }),
        auth: {
          authKey: 'cancel.share',
          resource: 'flat.network',
          type: 'action'
        },
      },
      {
        key: 'virtualization.delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'virtualization.delete',
          resource: 'flat.network',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'sub.alarm/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.alarm/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.flat.shared-resource/directory': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.flat.shared-resource/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.l2-network/row': {
        extraKeys: [],
        activeKeys: ['virtualization.add.ipv4.range', 'virtualization.add.ipv6.ipRange', 'virtualization.add.dns', 'virtualization.create.hostKernelInterface', 'virtualization.edit.name.and.description', 'virtualization.edit.config', 'virtualization.set.resource.attribute', 'virtualization.set.shareType', 'virtualization.delete'],
      },
      'sub.virtualization.l2-network/toolbar': {
        extraKeys: ['virtualization.create'],
        activeKeys: ['virtualization.set.resource.attribute', 'virtualization.set.shareType', 'virtualization.delete'],
      },
      'sub.virtualization.zone/row': {
        extraKeys: [],
        activeKeys: ['virtualization.add.ipv4.range', 'virtualization.add.ipv6.ipRange', 'virtualization.add.dns', 'virtualization.create.hostKernelInterface', 'virtualization.edit.name.and.description', 'virtualization.edit.config', 'virtualization.set.resource.attribute', 'virtualization.set.shareType', 'virtualization.delete'],
      },
      'sub.virtualization.zone/toolbar': {
        extraKeys: ['virtualization.create'],
        activeKeys: ['virtualization.set.resource.attribute', 'virtualization.set.shareType', 'virtualization.delete'],
      },
      'sub.zsv.shared.resource/row': {
        extraKeys: [],
        activeKeys: ['virtualization.add.ipv4.range', 'virtualization.add.ipv6.ipRange', 'virtualization.add.dns', 'virtualization.edit.name.and.description', 'virtualization.edit.config', 'virtualization.set.resource.attribute', 'virtualization.set.shareType', 'cancel.share', 'virtualization.delete'],
      },
      'sub.zsv.shared.resource/toolbar': {
        extraKeys: ['share.resource', 'cancel.share'],
        activeKeys: [],
      },
      'virtualization.detail.disableIPAM/header': {
        extraKeys: [],
        activeKeys: ['virtualization.add.dns', 'virtualization.create.hostKernelInterface', 'virtualization.edit.name.and.description', 'virtualization.edit.config', 'virtualization.set.resource.attribute', 'virtualization.set.shareType', 'cancel.share', 'virtualization.delete'],
      },
      'virtualization.detail/header': {
        extraKeys: [],
        activeKeys: ['virtualization.add.ipv4.range', 'virtualization.add.ipv6.ipRange', 'virtualization.add.dns', 'virtualization.create.hostKernelInterface', 'virtualization.edit.name.and.description', 'virtualization.edit.config', 'virtualization.set.resource.attribute', 'virtualization.set.shareType', 'virtualization.delete'],
      },
      'virtualization.dir.network.resource/directory': {
        extraKeys: [],
        activeKeys: ['virtualization.add.ipv4.range', 'virtualization.add.ipv6.ipRange', 'virtualization.add.dns', 'virtualization.create.hostKernelInterface', 'virtualization.edit.name.and.description', 'virtualization.edit.config', 'virtualization.set.resource.attribute', 'virtualization.set.shareType', 'virtualization.delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('flat-network', intl).then(remoteConfig => {
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
