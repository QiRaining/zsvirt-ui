import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'host.scsi.lun.attach.vm' | 'host.scsi.lun.detach.vm' | 'vm.scsi.lun.attach.vm' | 'vm.scsi.lun.detach.vm'

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
        key: 'host.scsi.lun.attach.vm',
        name: intl.formatMessage({ id: 'attach.vm', defaultMessage: 'Attach Virtual Machine' }),
        auth: {
          authKey: 'host.scsi.lun.attach.vm',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'host.scsi.lun.detach.vm',
        name: intl.formatMessage({ id: 'detach.vm', defaultMessage: 'Detach Virtual Machine' }),
        auth: {
          authKey: 'host.scsi.lun.detach.vm',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'vm.scsi.lun.attach.vm',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'vm.scsi.lun.attach.vm',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'vm.scsi.lun.detach.vm',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'vm.scsi.lun.detach.vm',
          resource: 'vm',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['host.scsi.lun.attach.vm', 'host.scsi.lun.detach.vm'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.host/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.host/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.multipath/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.storage.adapter/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.storage.adapter/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.vm-instance/row': {
        extraKeys: [],
        activeKeys: ['vm.scsi.lun.detach.vm'],
      },
      'sub.vm-instance/toolbar': {
        extraKeys: ['vm.scsi.lun.attach.vm', 'vm.scsi.lun.detach.vm'],
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
      genActionFromRemote('scsi-lun', intl).then(remoteConfig => {
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
