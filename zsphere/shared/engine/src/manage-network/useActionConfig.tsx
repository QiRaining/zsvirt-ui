import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.network' | 'create.manage.network' | 'edit' | 'add.ip.range' | 'add.dns' | 'set.share.mode' | 'set.default.network' | 'delete'

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
          resource: 'manage.network',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'create.manage.network',
        name: intl.formatMessage({ id: 'create.manageNetwork', defaultMessage: 'Create Management Network' }),
        auth: {
          authKey: 'create.manage.network',
          resource: 'manage.network',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'manage.network',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'add.ip.range',
        name: intl.formatMessage({ id: 'add.networkRange', defaultMessage: 'Add Network Range' }),
        auth: {
          authKey: 'add.ip.range',
          resource: 'manage.network',
          type: 'action'
        },
      },
      {
        key: 'add.dns',
        name: intl.formatMessage({ id: 'add.dns', defaultMessage: 'Add DNS' }),
        auth: {
          authKey: 'add.dns',
          resource: 'manage.network',
          type: 'action'
        },
      },
      {
        key: 'set.share.mode',
        name: intl.formatMessage({ id: 'set.shareType', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'set.share.mode',
          resource: 'manage.network',
          type: 'action'
        },
      },
      {
        key: 'set.default.network',
        name: intl.formatMessage({ id: 'set.defaultNetwork', defaultMessage: 'Set as Default Network' }),
        auth: {
          authKey: 'set.default.network',
          resource: 'manage.network',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'manage.network',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main.manage/header': {
        extraKeys: [],
        activeKeys: ['edit', 'add.ip.range', 'delete'],
      },
      'main.manage/row': {
        extraKeys: [],
        activeKeys: ['edit', 'add.ip.range', 'delete'],
      },
      'main.manage/toolbar': {
        extraKeys: ['create.manage.network', 'delete'],
        activeKeys: [],
      },
      'sub.manage/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.manage/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('manage-network', intl).then(remoteConfig => {
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
