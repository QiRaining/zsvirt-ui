import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'cluster.vgpu.enable' | 'cluster.vgpu.disable' | 'cluster.vgpu.set.share.type' | 'host.vgpu.enable' | 'host.vgpu.disable' | 'host.vgpu.set.share.type' | 'attach.vgpu.device' | 'detach.vgpu.device'

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
        key: 'cluster.vgpu.enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'cluster.vgpu.enable',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'cluster.vgpu.disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'cluster.vgpu.disable',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'cluster.vgpu.set.share.type',
        name: intl.formatMessage({ id: 'set.shareType', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'cluster.vgpu.set.share.type',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'host.vgpu.enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'host.vgpu.enable',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'host.vgpu.disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'host.vgpu.disable',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'host.vgpu.set.share.type',
        name: intl.formatMessage({ id: 'set.shareMode', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'host.vgpu.set.share.type',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'attach.vgpu.device',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.vgpu.device',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'detach.vgpu.device',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.vgpu.device',
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
        activeKeys: ['cluster.vgpu.enable', 'cluster.vgpu.disable', 'cluster.vgpu.set.share.type'],
      },
      'sub.cluster/toolbar': {
        extraKeys: ['cluster.vgpu.enable', 'cluster.vgpu.disable'],
        activeKeys: ['cluster.vgpu.set.share.type'],
      },
      'sub.host/row': {
        extraKeys: [],
        activeKeys: ['host.vgpu.enable', 'host.vgpu.disable', 'host.vgpu.set.share.type'],
      },
      'sub.host/toolbar': {
        extraKeys: ['host.vgpu.enable', 'host.vgpu.disable'],
        activeKeys: ['host.vgpu.set.share.type'],
      },
      'sub.vm/row': {
        extraKeys: [],
        activeKeys: ['detach.vgpu.device'],
      },
      'sub.vm/toolbar': {
        extraKeys: ['attach.vgpu.device', 'detach.vgpu.device'],
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
      genActionFromRemote('vgpu-device', intl).then(remoteConfig => {
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
