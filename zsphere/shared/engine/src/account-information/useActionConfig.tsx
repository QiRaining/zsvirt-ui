import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.account' | 'edit' | 'editor.password' | 'bind.to.price.table' | 'modify.price.table' | 'delete' | 'virtualization.new.user' | 'enable' | 'disabled' | 'virtualization.edit.user.info' | 'modify.config' | 'virtualization.edit.password' | 'change.to.administrator.user' | 'bind.role' | 'join.user.group' | 'share.resource' | 'add.user' | 'remove.user' | 'shared' | 'recall' | 'virtualization.delete'

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
        key: 'create.account',
        name: intl.formatMessage({ id: 'create.subAccount', defaultMessage: 'Create User' }),
        auth: {
          authKey: 'create.account',
          resource: 'account.information',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'account.information',
          type: 'action'
        },
      },
      {
        key: 'editor.password',
        name: intl.formatMessage({ id: 'change.password', defaultMessage: 'Change Password' }),
        auth: {
          authKey: 'editor.password',
          resource: 'account.information',
          type: 'action'
        },
      },
      {
        key: 'bind.to.price.table',
        name: intl.formatMessage({ id: 'bind.accountInformation', defaultMessage: 'Bind User' }),
        auth: {
          authKey: 'bind.to.price.table',
          resource: 'account.information',
          type: 'action'
        },
      },
      {
        key: 'modify.price.table',
        name: intl.formatMessage({ id: 'change.pricingList', defaultMessage: 'Change Pricing List' }),
        auth: {
          authKey: 'modify.price.table',
          resource: 'account.information',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'account.information',
          type: 'action'
        },
      },
      {
        key: 'virtualization.new.user',
        name: intl.formatMessage({ id: 'virtualization.new.user', defaultMessage: 'New User' }),
        auth: {
          authKey: 'virtualization.new.user',
          resource: 'account.information',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable.zsv', defaultMessage: 'Enable' }),
        auth: {
          authKey: 'enable',
          resource: 'account.information',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disabled',
        name: intl.formatMessage({ id: 'disabled.zsv', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disabled',
          resource: 'account.information',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'disabled-divider',
        divider: true,
      },
      {
        key: 'virtualization.edit.user.info',
        name: intl.formatMessage({ id: 'virtualization.edit.user.info', defaultMessage: 'Edit User Information' }),
        auth: {
          authKey: 'virtualization.edit.user.info',
          resource: 'account.information',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'modify.config',
        name: intl.formatMessage({ id: 'modify.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'modify.config',
          resource: 'account.information',
          type: 'action'
        },
      },
      {
        key: 'virtualization.edit.password',
        name: intl.formatMessage({ id: 'virtualization.edit.password', defaultMessage: 'Change Password' }),
        auth: {
          authKey: 'virtualization.edit.password',
          resource: 'account.information',
          type: 'action'
        },
      },
      {
        key: 'change.to.administrator.user',
        name: intl.formatMessage({ id: 'change.to.administrator.user', defaultMessage: 'Change to Admin User' }),
        auth: {
          authKey: 'change.to.administrator.user',
          resource: 'account.information',
          type: 'action'
        },
      },
      {
        key: 'change.to.administrator.user-divider',
        divider: true,
      },
      {
        key: 'bind.role',
        name: intl.formatMessage({ id: 'bind.role', defaultMessage: 'Assign Role' }),
        auth: {
          authKey: 'bind.role',
          resource: 'account.information',
          type: 'action'
        },
      },
      {
        key: 'join.user.group',
        name: intl.formatMessage({ id: 'join.user.group', defaultMessage: 'Join User Group' }),
        auth: {
          authKey: 'join.user.group',
          resource: 'account.information',
          type: 'action'
        },
      },
      {
        key: 'share.resource',
        name: intl.formatMessage({ id: 'share.resource', defaultMessage: 'Share Resource' }),
        auth: {
          authKey: 'share.resource',
          resource: 'account.information',
          type: 'action'
        },
      },
      {
        key: 'share.resource-divider',
        divider: true,
      },
      {
        key: 'add.user',
        name: intl.formatMessage({ id: 'add.user', defaultMessage: 'Add User' }),
        auth: {
          authKey: 'add.user',
          resource: 'account.information',
          type: 'action'
        },
      },
      {
        key: 'remove.user',
        name: intl.formatMessage({ id: 'remove.user', defaultMessage: 'Remove User' }),
        auth: {
          authKey: 'remove.user',
          resource: 'account.information',
          type: 'action'
        },
      },
      {
        key: 'shared',
        name: intl.formatMessage({ id: 'shared', defaultMessage: 'Share' }),
        auth: {
          authKey: 'shared',
          resource: 'account.information',
          type: 'action'
        },
      },
      {
        key: 'recall',
        name: intl.formatMessage({ id: 'recall', defaultMessage: 'Unshare' }),
        auth: {
          authKey: 'recall',
          resource: 'account.information',
          type: 'action'
        },
      },
      {
        key: 'virtualization.delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'virtualization.delete',
          resource: 'account.information',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'editor.password', 'modify.price.table', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'editor.password', 'modify.price.table', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.account'],
        activeKeys: ['modify.price.table', 'delete'],
      },
      'sub.billings.price.table/row': {
        extraKeys: [],
        activeKeys: ['modify.price.table'],
      },
      'sub.billings.price.table/toolbar': {
        extraKeys: ['bind.to.price.table', 'modify.price.table'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['create.account', 'modify.price.table', 'delete'],
      },
      'sub/toolbar': {
        extraKeys: [],
        activeKeys: ['modify.price.table', 'delete'],
      },
      'virtualization.main/header': {
        extraKeys: [],
        activeKeys: ['enable', 'disabled', 'modify.config', 'virtualization.edit.password', 'change.to.administrator.user', 'virtualization.delete'],
      },
      'virtualization.main/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disabled', 'modify.config', 'virtualization.edit.password', 'change.to.administrator.user', 'virtualization.delete'],
      },
      'virtualization.main/toolbar': {
        extraKeys: ['virtualization.new.user', 'enable', 'disabled'],
        activeKeys: ['change.to.administrator.user', 'bind.role', 'join.user.group', 'share.resource', 'virtualization.delete'],
      },
      'virtualization.sub.role/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disabled', 'modify.config', 'virtualization.edit.password', 'virtualization.delete'],
      },
      'virtualization.sub.shareAuth/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disabled', 'modify.config', 'virtualization.edit.password', 'recall', 'virtualization.delete'],
      },
      'virtualization.sub.shareAuth/toolbar': {
        extraKeys: ['shared', 'recall'],
        activeKeys: [],
      },
      'virtualization.sub.userGroup/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disabled', 'modify.config', 'virtualization.edit.password', 'remove.user', 'virtualization.delete'],
      },
      'virtualization.sub.userGroup/toolbar': {
        extraKeys: ['add.user', 'remove.user'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('account-information', intl).then(remoteConfig => {
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
