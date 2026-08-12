import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'attach.vm' | 'detach.vm' | 'sync.fclun.info' | 'check.cluster.status'

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
        key: 'attach.vm',
        name: intl.formatMessage({ id: 'attach.vm', defaultMessage: 'Attach Virtual Machine' }),
        auth: {
          authKey: 'attach.vm',
          resource: 'fiber.channel.lun',
          type: 'action'
        },
      },
      {
        key: 'detach.vm',
        name: intl.formatMessage({ id: 'detach.vm', defaultMessage: 'Detach Virtual Machine' }),
        auth: {
          authKey: 'detach.vm',
          resource: 'fiber.channel.lun',
          type: 'action'
        },
      },
      {
        key: 'sync.fclun.info',
        name: intl.formatMessage({ id: 'sync.fclun.info', defaultMessage: 'Sync LUN Info' }),
        auth: {
          authKey: 'sync.fclun.info',
          resource: 'fiber.channel.lun',
          type: 'action'
        },
      },
      {
        key: 'check.cluster.status',
        name: intl.formatMessage({ id: 'check.cluster.status', defaultMessage: 'Check Cluster Status' }),
        auth: {
          authKey: 'check.cluster.status',
          resource: 'fiber.channel.lun',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.nvme': {
        extraKeys: [],
        activeKeys: [],
      },
      'main.nvme/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/header': {
        extraKeys: [],
        activeKeys: ['attach.vm', 'detach.vm', 'sync.fclun.info', 'check.cluster.status'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['attach.vm', 'detach.vm', 'sync.fclun.info', 'check.cluster.status'],
      },
      'main/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.cluster/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.fiber-channel-storage/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.fiber-channel-storage/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.host/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.data.storage/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.vm-instance/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['attach.vm', 'detach.vm'],
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
      genActionFromRemote('fiber-channel-lun', intl).then(remoteConfig => {
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
