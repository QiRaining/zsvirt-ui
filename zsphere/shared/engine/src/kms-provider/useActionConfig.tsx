import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create' | 'set.default' | 'edit.config' | 'backup' | 'restore' | 'update.data.encryption.key' | 'delete'

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
        key: 'create',
        name: intl.formatMessage({ id: 'create.kms.provider', defaultMessage: 'Add Key Provider' }),
        auth: {
          authKey: 'create',
          resource: 'kms.provider',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'set.default',
        name: intl.formatMessage({ id: 'set.defaults', defaultMessage: 'Set as Default' }),
        auth: {
          authKey: 'set.default',
          resource: 'kms.provider',
          type: 'action'
        },
      },
      {
        key: 'set.default-divider',
        divider: true,
      },
      {
        key: 'edit.config',
        name: intl.formatMessage({ id: 'edit.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'edit.config',
          resource: 'kms.provider',
          type: 'action'
        },
      },
      {
        key: 'backup',
        name: intl.formatMessage({ id: 'backup', defaultMessage: 'Backup' }),
        auth: {
          authKey: 'backup',
          resource: 'kms.provider',
          type: 'action'
        },
      },
      {
        key: 'restore',
        name: intl.formatMessage({ id: 'restore', defaultMessage: 'Restore' }),
        auth: {
          authKey: 'restore',
          resource: 'kms.provider',
          type: 'action'
        },
        icon: 'repeat',
      },
      {
        key: 'update.data.encryption.key',
        name: intl.formatMessage({ id: 'update.data.encryption.key', defaultMessage: 'Rekey' }),
        auth: {
          authKey: 'update.data.encryption.key',
          resource: 'kms.provider',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'kms.provider',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['set.default'],
        activeKeys: ['edit.config', 'backup', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['set.default', 'edit.config', 'backup', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create'],
        activeKeys: ['restore', 'update.data.encryption.key'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('kms-provider', intl).then(remoteConfig => {
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
