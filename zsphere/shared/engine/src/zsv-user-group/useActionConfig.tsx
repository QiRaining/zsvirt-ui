import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.user.group' | 'add.user' | 'bind.role' | 'virtualization.sharedResource' | 'modifyconfig.zsv' | 'share' | 'recall' | 'join.userGroup' | 'remove.from.user.group' | 'virtualization.delete'

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
        key: 'create.user.group',
        name: intl.formatMessage({ id: 'create.user.group', defaultMessage: 'New User Group' }),
        auth: {
          authKey: 'create.user.group',
          resource: 'zsv.user.group',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'add.user',
        name: intl.formatMessage({ id: 'add.user', defaultMessage: 'Add User' }),
        auth: {
          authKey: 'add.user',
          resource: 'zsv.user.group',
          type: 'action'
        },
      },
      {
        key: 'bind.role',
        name: intl.formatMessage({ id: 'bind.role', defaultMessage: 'Assign Role' }),
        auth: {
          authKey: 'bind.role',
          resource: 'zsv.user.group',
          type: 'action'
        },
      },
      {
        key: 'virtualization.sharedResource',
        name: intl.formatMessage({ id: 'virtualization.sharedResource', defaultMessage: 'Share Resource' }),
        auth: {
          authKey: 'virtualization.sharedResource',
          resource: 'zsv.user.group',
          type: 'action'
        },
      },
      {
        key: 'virtualization.sharedResource-divider',
        divider: true,
      },
      {
        key: 'modifyconfig.zsv',
        name: intl.formatMessage({ id: 'modifyconfig.zsv', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'modifyconfig.zsv',
          resource: 'zsv.user.group',
          type: 'action'
        },
      },
      {
        key: 'modifyconfig.zsv-divider',
        divider: true,
      },
      {
        key: 'share',
        name: intl.formatMessage({ id: 'share', defaultMessage: 'Share' }),
        auth: {
          authKey: 'share',
          resource: 'zsv.user.group',
          type: 'action'
        },
      },
      {
        key: 'recall',
        name: intl.formatMessage({ id: 'recall', defaultMessage: 'Unshare' }),
        auth: {
          authKey: 'recall',
          resource: 'zsv.user.group',
          type: 'action'
        },
      },
      {
        key: 'join.userGroup',
        name: intl.formatMessage({ id: 'virtualization.join.user.group', defaultMessage: 'Join User Group' }),
        auth: {
          authKey: 'join.userGroup',
          resource: 'zsv.user.group',
          type: 'action'
        },
      },
      {
        key: 'remove.from.user.group',
        name: intl.formatMessage({ id: 'remove.from.user.group', defaultMessage: 'Remove from User Group' }),
        auth: {
          authKey: 'remove.from.user.group',
          resource: 'zsv.user.group',
          type: 'action'
        },
      },
      {
        key: 'virtualization.delete',
        name: intl.formatMessage({ id: 'virtualization.delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'virtualization.delete',
          resource: 'zsv.user.group',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'virtualization.main/header': {
        extraKeys: [],
        activeKeys: ['modifyconfig.zsv', 'virtualization.delete'],
      },
      'virtualization.main/row': {
        extraKeys: [],
        activeKeys: ['modifyconfig.zsv', 'virtualization.delete'],
      },
      'virtualization.main/toolbar': {
        extraKeys: ['create.user.group'],
        activeKeys: ['add.user', 'bind.role', 'virtualization.sharedResource', 'virtualization.delete'],
      },
      'virtualization.sub.role/row': {
        extraKeys: [],
        activeKeys: ['modifyconfig.zsv', 'virtualization.delete'],
      },
      'virtualization.sub.shareAuth/row': {
        extraKeys: [],
        activeKeys: ['recall', 'virtualization.delete'],
      },
      'virtualization.sub.shareAuth/toolbar': {
        extraKeys: ['share', 'recall'],
        activeKeys: [],
      },
      'virtualization.sub.user/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'virtualization.sub.user/row': {
        extraKeys: [],
        activeKeys: ['modifyconfig.zsv', 'remove.from.user.group', 'virtualization.delete'],
      },
      'virtualization.sub.user/toolbar': {
        extraKeys: ['join.userGroup', 'remove.from.user.group'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('zsv-user-group', intl).then(remoteConfig => {
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
