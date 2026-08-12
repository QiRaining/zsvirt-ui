import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.vip' | 'edit' | 'remove' | 'attach.alarm' | 'detach.alarm'

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
        key: 'create.vip',
        name: intl.formatMessage({ id: 'create.vip', defaultMessage: 'Create VIP' }),
        auth: {
          authKey: 'create.vip',
          resource: 'vip',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'vip',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'remove',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'remove',
          resource: 'vip',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'attach.alarm',
        name: intl.formatMessage({ id: 'add', defaultMessage: 'Add' }),
        auth: {
          authKey: 'attach.alarm',
          resource: 'vip',
          type: 'action'
        },
      },
      {
        key: 'detach.alarm',
        name: intl.formatMessage({ id: 'remove', defaultMessage: 'Remove' }),
        auth: {
          authKey: 'detach.alarm',
          resource: 'vip',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.system/header': {
        extraKeys: [],
        activeKeys: ['remove'],
      },
      'main.system/row': {
        extraKeys: ['remove'],
        activeKeys: [],
      },
      'main.system/toolbar': {
        extraKeys: [],
        activeKeys: ['remove'],
      },
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'remove'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'remove'],
      },
      'main/toolbar': {
        extraKeys: ['create.vip'],
        activeKeys: ['remove'],
      },
      'sub.alarm/row': {
        extraKeys: [],
        activeKeys: ['detach.alarm'],
      },
      'sub.alarm/toolbar': {
        extraKeys: ['attach.alarm', 'detach.alarm'],
        activeKeys: [],
      },
      'sub.vpc/row': {
        extraKeys: ['remove'],
        activeKeys: [],
      },
      'sub.vpc/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['remove'],
      },
      'sub/toolbar': {
        extraKeys: ['remove'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('vip', intl).then(remoteConfig => {
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
