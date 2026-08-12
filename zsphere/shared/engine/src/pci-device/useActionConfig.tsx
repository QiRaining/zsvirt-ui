import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'cluster.pcidevice.enable' | 'cluster.pcidevice.disable' | 'host.pcidevice.enable' | 'host.pcidevice.disable' | 'attach.pci.device' | 'detach.pci.device' | 'virtualization.toggle.passthrough'

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
        key: 'cluster.pcidevice.enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'cluster.pcidevice.enable',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'cluster.pcidevice.disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'cluster.pcidevice.disable',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'cluster.pcidevice.disable-divider',
        divider: true,
      },
      {
        key: 'host.pcidevice.enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'host.pcidevice.enable',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'host.pcidevice.disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'host.pcidevice.disable',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'host.pcidevice.disable-divider',
        divider: true,
      },
      {
        key: 'attach.pci.device',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.pci.device',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'detach.pci.device',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.pci.device',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'virtualization.toggle.passthrough',
        name: intl.formatMessage({ id: 'toggle.passthrough', defaultMessage: 'Toggle Passthrough' }),
        auth: {
          authKey: 'virtualization.toggle.passthrough',
          resource: 'host',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.passthrough/row': {
        extraKeys: [],
        activeKeys: ['virtualization.toggle.passthrough'],
      },
      'main.passthrough/toolbar': {
        extraKeys: ['virtualization.toggle.passthrough'],
        activeKeys: [],
      },
      'main/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['virtualization.toggle.passthrough'],
      },
      'main/toolbar': {
        extraKeys: ['virtualization.toggle.passthrough'],
        activeKeys: [],
      },
      'sub.cluster/row': {
        extraKeys: [],
        activeKeys: ['cluster.pcidevice.enable', 'cluster.pcidevice.disable'],
      },
      'sub.cluster/toolbar': {
        extraKeys: ['cluster.pcidevice.enable', 'cluster.pcidevice.disable'],
        activeKeys: [],
      },
      'sub.host/row': {
        extraKeys: [],
        activeKeys: ['host.pcidevice.enable', 'host.pcidevice.disable'],
      },
      'sub.host/toolbar': {
        extraKeys: ['host.pcidevice.enable', 'host.pcidevice.disable'],
        activeKeys: [],
      },
      'sub.vm/row': {
        extraKeys: [],
        activeKeys: ['attach.pci.device', 'detach.pci.device'],
      },
      'sub.vm/toolbar': {
        extraKeys: ['attach.pci.device', 'detach.pci.device'],
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
      genActionFromRemote('pci-device', intl).then(remoteConfig => {
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
