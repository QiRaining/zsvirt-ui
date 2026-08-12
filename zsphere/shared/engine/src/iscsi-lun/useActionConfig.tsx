import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'iqn.iscsi.lun.attach.vm' | 'iqn.iscsi.lun.detach.vm' | 'virtualization.iqn.iscsi.lun.attach.vm' | 'virtualization.iqn.iscsi.lun.detach.vm'

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
        key: 'iqn.iscsi.lun.attach.vm',
        name: intl.formatMessage({ id: 'attach.vm', defaultMessage: 'Attach Virtual Machine' }),
        auth: {
          authKey: 'iqn.iscsi.lun.attach.vm',
          resource: 'iscsi.lun',
          type: 'action'
        },
      },
      {
        key: 'iqn.iscsi.lun.detach.vm',
        name: intl.formatMessage({ id: 'detach.vm', defaultMessage: 'Detach Virtual Machine' }),
        auth: {
          authKey: 'iqn.iscsi.lun.detach.vm',
          resource: 'iscsi.lun',
          type: 'action'
        },
      },
      {
        key: 'virtualization.iqn.iscsi.lun.attach.vm',
        name: intl.formatMessage({ id: 'attach.vm', defaultMessage: 'Attach Virtual Machine' }),
        auth: {
          authKey: 'virtualization.iqn.iscsi.lun.attach.vm',
          resource: 'iscsi.lun',
          type: 'action'
        },
      },
      {
        key: 'virtualization.iqn.iscsi.lun.detach.vm',
        name: intl.formatMessage({ id: 'detach.vm', defaultMessage: 'Detach Virtual Machine' }),
        auth: {
          authKey: 'virtualization.iqn.iscsi.lun.detach.vm',
          resource: 'iscsi.lun',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['iqn.iscsi.lun.attach.vm', 'iqn.iscsi.lun.detach.vm'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.iqn/row': {
        extraKeys: [],
        activeKeys: ['iqn.iscsi.lun.attach.vm', 'iqn.iscsi.lun.detach.vm'],
      },
      'sub.iqn/toolbar': {
        extraKeys: ['iqn.iscsi.lun.attach.vm', 'iqn.iscsi.lun.detach.vm'],
        activeKeys: [],
      },
      'sub.virtualization.iqn/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.iqn/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.iqn/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['iqn.iscsi.lun.attach.vm', 'iqn.iscsi.lun.detach.vm'],
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
      genActionFromRemote('iscsi-lun', intl).then(remoteConfig => {
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
