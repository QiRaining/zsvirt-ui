import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'sync' | 'testConnect' | 'virtualization.edit.name.and.description' | 'virtualization.edit.config' | 'virtualization.edit.info' | 'modify.rulesMapping' | 'virtualization.delete' | 'virtualization.create'

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
        key: 'sync',
        name: intl.formatMessage({ id: 'sync', defaultMessage: 'Synchronize' }),
        auth: {
          authKey: 'sync',
          resource: 'account.third.party.auth',
          type: 'action'
        },
        icon: 'sync',
      },
      {
        key: 'testConnect',
        name: intl.formatMessage({ id: 'test.connect', defaultMessage: 'Test Connection' }),
        auth: {
          authKey: 'testConnect',
          resource: 'account.third.party.auth',
          type: 'action'
        },
        icon: 'link',
      },
      {
        key: 'virtualization.edit.name.and.description',
        name: intl.formatMessage({ id: 'edit.name.and.description', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'virtualization.edit.name.and.description',
          resource: 'account.third.party.auth',
          type: 'action'
        },
      },
      {
        key: 'virtualization.edit.config',
        name: intl.formatMessage({ id: 'virtualization.edit.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'virtualization.edit.config',
          resource: 'account.third.party.auth',
          type: 'action'
        },
      },
      {
        key: 'virtualization.edit.info',
        name: intl.formatMessage({ id: 'edit.config.info', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'virtualization.edit.info',
          resource: 'account.third.party.auth',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'virtualization.edit.info-divider',
        divider: true,
      },
      {
        key: 'modify.rulesMapping',
        name: intl.formatMessage({ id: 'modify.rulesMapping', defaultMessage: 'Modify Mapping Rule' }),
        auth: {
          authKey: 'modify.rulesMapping',
          resource: 'account.third.party.auth',
          type: 'action'
        },
      },
      {
        key: 'virtualization.delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'virtualization.delete',
          resource: 'account.third.party.auth',
          type: 'action'
        },
      },
      {
        key: 'virtualization.create',
        name: intl.formatMessage({ id: 'create', defaultMessage: 'Create' }),
        auth: {
          authKey: 'virtualization.create',
          resource: 'account.third.party.auth',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'virtualization.ldap.main/header': {
        extraKeys: ['sync', 'testConnect'],
        activeKeys: ['virtualization.edit.name.and.description', 'virtualization.edit.info', 'virtualization.delete'],
      },
      'virtualization.main/header': {
        extraKeys: ['virtualization.edit.name.and.description'],
        activeKeys: ['virtualization.edit.config', 'virtualization.delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('account-third-party-auth', intl).then(remoteConfig => {
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
