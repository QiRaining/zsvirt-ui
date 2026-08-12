import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create' | 'edit' | 'add.value' | 'delete'

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
        name: intl.formatMessage({ id: 'create.resource.attribute.key', defaultMessage: 'New Custom Attribute' }),
        auth: {
          authKey: 'create',
          resource: 'resource.attribute.key',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'edit',
          resource: 'resource.attribute.key',
          type: 'action'
        },
      },
      {
        key: 'add.value',
        name: intl.formatMessage({ id: 'add.resource.attribute.value', defaultMessage: 'Add Attribute Value' }),
        auth: {
          authKey: 'add.value',
          resource: 'resource.attribute.key',
          type: 'action'
        },
      },
      {
        key: 'add.value-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'resource.attribute.key',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'add.value', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'add.value', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create', 'delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('resource-attribute-key', intl).then(remoteConfig => {
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
