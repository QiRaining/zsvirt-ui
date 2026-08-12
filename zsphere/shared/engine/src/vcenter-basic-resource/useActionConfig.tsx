import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'edit.vCenter' | 'add.vCenter' | 'sync.vCenter' | 'delete.vCenter'

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
        key: 'edit.vCenter',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit.vCenter',
          resource: 'vcenter.basic.resource',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'add.vCenter',
        name: intl.formatMessage({ id: 'add.vCenter', defaultMessage: 'Add vCenter' }),
        auth: {
          authKey: 'add.vCenter',
          resource: 'vcenter.basic.resource',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'sync.vCenter',
        name: intl.formatMessage({ id: 'sync.vCenter', defaultMessage: 'Sync Data' }),
        auth: {
          authKey: 'sync.vCenter',
          resource: 'vcenter.basic.resource',
          type: 'action'
        },
        icon: 'swap',
      },
      {
        key: 'delete.vCenter',
        name: intl.formatMessage({ id: 'delete.vCenter', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete.vCenter',
          resource: 'vcenter.basic.resource',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['sync.vCenter', 'delete.vCenter'],
        activeKeys: ['edit.vCenter'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['sync.vCenter', 'delete.vCenter'],
      },
      'main/toolbar': {
        extraKeys: ['add.vCenter', 'sync.vCenter', 'delete.vCenter'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('vcenter-basic-resource', intl).then(remoteConfig => {
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
