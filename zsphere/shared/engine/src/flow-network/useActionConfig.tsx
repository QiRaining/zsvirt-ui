import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.flow.network' | 'edit' | 'add.ip.range' | 'add.dns' | 'set.share.mode' | 'set.default.network' | 'delete'

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
        key: 'create.flow.network',
        name: intl.formatMessage({ id: 'create.flowNetwork', defaultMessage: 'Create Flow Network' }),
        auth: {
          authKey: 'create.flow.network',
          resource: 'flow.network',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'flow.network',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'add.ip.range',
        name: intl.formatMessage({ id: 'add.networkRange', defaultMessage: 'Add Network Range' }),
        auth: {
          authKey: 'add.ip.range',
          resource: 'flow.network',
          type: 'action'
        },
      },
      {
        key: 'add.dns',
        name: intl.formatMessage({ id: 'add.dns', defaultMessage: 'Add DNS' }),
        auth: {
          authKey: 'add.dns',
          resource: 'flow.network',
          type: 'action'
        },
      },
      {
        key: 'set.share.mode',
        name: intl.formatMessage({ id: 'set.shareType', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'set.share.mode',
          resource: 'flow.network',
          type: 'action'
        },
      },
      {
        key: 'set.default.network',
        name: intl.formatMessage({ id: 'set.defaultNetwork', defaultMessage: 'Set as Default Network' }),
        auth: {
          authKey: 'set.default.network',
          resource: 'flow.network',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'flow.network',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main.flow/header': {
        extraKeys: [],
        activeKeys: ['edit', 'add.ip.range', 'delete'],
      },
      'main.flow/row': {
        extraKeys: [],
        activeKeys: ['edit', 'add.ip.range', 'delete'],
      },
      'main.flow/toolbar': {
        extraKeys: ['create.flow.network', 'delete'],
        activeKeys: [],
      },
      'sub.flow/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.flow/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('flow-network', intl).then(remoteConfig => {
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
