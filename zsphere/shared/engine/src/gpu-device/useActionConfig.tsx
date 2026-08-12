import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'cluster.gpu.enable' | 'cluster.gpu.disable' | 'cluster.gpu.set.share.type' | 'cluster.gpu.generate' | 'cluster.gpu.ungenerate' | 'host.gpu.enable' | 'host.gpu.disable' | 'host.gpu.set.share.type' | 'host.gpu.generate' | 'host.gpu.ungenerate' | 'attach.gpu.device' | 'dettach.gpu.device'

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
        key: 'cluster.gpu.enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'cluster.gpu.enable',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'cluster.gpu.disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'cluster.gpu.disable',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'cluster.gpu.set.share.type',
        name: intl.formatMessage({ id: 'set.shareMode', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'cluster.gpu.set.share.type',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'cluster.gpu.set.share.type-divider',
        divider: true,
      },
      {
        key: 'cluster.gpu.generate',
        name: intl.formatMessage({ id: 'virtual.generate', defaultMessage: 'Virtualization' }),
        auth: {
          authKey: 'cluster.gpu.generate',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'cluster.gpu.ungenerate',
        name: intl.formatMessage({ id: 'virtual.ungenerate', defaultMessage: 'Virtualization Restoration' }),
        auth: {
          authKey: 'cluster.gpu.ungenerate',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'cluster.gpu.ungenerate-divider',
        divider: true,
      },
      {
        key: 'host.gpu.enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'host.gpu.enable',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'host.gpu.disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'host.gpu.disable',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'host.gpu.set.share.type',
        name: intl.formatMessage({ id: 'set.shareMode', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'host.gpu.set.share.type',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'host.gpu.set.share.type-divider',
        divider: true,
      },
      {
        key: 'host.gpu.generate',
        name: intl.formatMessage({ id: 'virtual.generate', defaultMessage: 'Virtualization' }),
        auth: {
          authKey: 'host.gpu.generate',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'host.gpu.ungenerate',
        name: intl.formatMessage({ id: 'virtual.ungenerate', defaultMessage: 'Virtualization Restoration' }),
        auth: {
          authKey: 'host.gpu.ungenerate',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'host.gpu.ungenerate-divider',
        divider: true,
      },
      {
        key: 'attach.gpu.device',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.gpu.device',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'dettach.gpu.device',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'dettach.gpu.device',
          resource: 'vm',
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
      'sub.cluster/row': {
        extraKeys: [],
        activeKeys: ['cluster.gpu.enable', 'cluster.gpu.disable', 'cluster.gpu.set.share.type', 'cluster.gpu.generate', 'cluster.gpu.ungenerate'],
      },
      'sub.cluster/toolbar': {
        extraKeys: ['cluster.gpu.enable', 'cluster.gpu.disable'],
        activeKeys: ['cluster.gpu.set.share.type'],
      },
      'sub.host/row': {
        extraKeys: [],
        activeKeys: ['host.gpu.enable', 'host.gpu.disable', 'host.gpu.set.share.type', 'host.gpu.generate', 'host.gpu.ungenerate'],
      },
      'sub.host/toolbar': {
        extraKeys: ['host.gpu.enable', 'host.gpu.disable'],
        activeKeys: ['host.gpu.set.share.type'],
      },
      'sub.vm/row': {
        extraKeys: [],
        activeKeys: ['dettach.gpu.device'],
      },
      'sub.vm/toolbar': {
        extraKeys: ['attach.gpu.device', 'dettach.gpu.device'],
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
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('gpu-device', intl).then(remoteConfig => {
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
