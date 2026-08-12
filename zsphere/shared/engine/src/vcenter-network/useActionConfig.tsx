import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.network' | 'edit' | 'add.ip.range' | 'add.dns' | 'set.share.mode' | 'delete' | 'cancel.share'

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
        key: 'create.network',
        name: intl.formatMessage({ id: 'create.network', defaultMessage: 'Create Network' }),
        auth: {
          authKey: 'create.network',
          resource: 'vcenter.network',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'vcenter.network',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'add.ip.range',
        name: intl.formatMessage({ id: 'add.networkRange', defaultMessage: 'Add Network Range' }),
        auth: {
          authKey: 'add.ip.range',
          resource: 'vcenter.network',
          type: 'action'
        },
      },
      {
        key: 'add.dns',
        name: intl.formatMessage({ id: 'add.dns', defaultMessage: 'Add DNS' }),
        auth: {
          authKey: 'add.dns',
          resource: 'vcenter.network',
          type: 'action'
        },
      },
      {
        key: 'set.share.mode',
        name: intl.formatMessage({ id: 'set.shareMode', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'set.share.mode',
          resource: 'vcenter.network',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'vcenter.network',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'cancel.share',
        name: intl.formatMessage({ id: 'cancel.share', defaultMessage: 'Unshare' }),
        auth: {
          authKey: 'cancel.share',
          resource: 'vcenter.network',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.vcenter/header': {
        extraKeys: [],
        activeKeys: ['edit', 'add.ip.range', 'add.dns', 'set.share.mode', 'delete'],
      },
      'main.vcenter/row': {
        extraKeys: [],
        activeKeys: ['add.ip.range', 'add.dns', 'set.share.mode', 'delete'],
      },
      'main.vcenter/toolbar': {
        extraKeys: ['create.network'],
        activeKeys: ['set.share.mode', 'delete'],
      },
      'sub.shared.resource/row': {
        extraKeys: ['cancel.share'],
        activeKeys: [],
      },
      'sub.shared.resource/toolbar': {
        extraKeys: ['cancel.share'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('vcenter-network', intl).then(remoteConfig => {
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
