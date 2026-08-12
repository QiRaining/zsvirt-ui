import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'edit' | 'creat.baremetalpxeservice' | 'start' | 'stop' | 'reconnect' | 'attach.baremetalcluster' | 'detach.baremetalcluster' | 'attach.in.baremetal.cluster' | 'detach.in.baremetal.cluster' | 'delete'

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
          resource: 'baremetal.pxe.server',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'creat.baremetalpxeservice',
        name: intl.formatMessage({ id: 'creat.baremetalpxeservice', defaultMessage: 'Attach Deployment Server' }),
        auth: {
          authKey: 'creat.baremetalpxeservice',
          resource: 'baremetal.pxe.server',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'start',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'start',
          resource: 'baremetal.pxe.server',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'stop',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'stop',
          resource: 'baremetal.pxe.server',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'reconnect',
        name: intl.formatMessage({ id: 'reconnect', defaultMessage: 'Reconnect' }),
        auth: {
          authKey: 'reconnect',
          resource: 'baremetal.pxe.server',
          type: 'action'
        },
      },
      {
        key: 'reconnect-divider',
        divider: true,
      },
      {
        key: 'attach.baremetalcluster',
        name: intl.formatMessage({ id: 'attach.baremetalCluster', defaultMessage: 'Attach Bare Metal Cluster' }),
        auth: {
          authKey: 'attach.baremetalcluster',
          resource: 'baremetal.pxe.server',
          type: 'action'
        },
      },
      {
        key: 'detach.baremetalcluster',
        name: intl.formatMessage({ id: 'detach.baremetalCluster', defaultMessage: 'Detach Bare Metal Cluster' }),
        auth: {
          authKey: 'detach.baremetalcluster',
          resource: 'baremetal.pxe.server',
          type: 'action'
        },
      },
      {
        key: 'detach.baremetalcluster-divider',
        divider: true,
      },
      {
        key: 'attach.in.baremetal.cluster',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.in.baremetal.cluster',
          resource: 'baremetal.pxe.server',
          type: 'action'
        },
      },
      {
        key: 'detach.in.baremetal.cluster',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.in.baremetal.cluster',
          resource: 'baremetal.pxe.server',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'baremetal.pxe.server',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['start', 'stop'],
        activeKeys: ['edit', 'reconnect', 'attach.baremetalcluster', 'detach.baremetalcluster', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'start', 'stop', 'reconnect', 'attach.baremetalcluster', 'detach.baremetalcluster', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['creat.baremetalpxeservice', 'start', 'stop'],
        activeKeys: ['reconnect', 'delete'],
      },
      'sub.baremetal.cluster/row': {
        extraKeys: [],
        activeKeys: ['detach.in.baremetal.cluster'],
      },
      'sub.baremetal.cluster/toolbar': {
        extraKeys: ['attach.in.baremetal.cluster', 'detach.in.baremetal.cluster'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('baremetal-pxe-server', intl).then(remoteConfig => {
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
