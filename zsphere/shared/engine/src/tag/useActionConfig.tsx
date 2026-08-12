import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'virtualization.create.tag' | 'virtualization.bind.resource' | 'virtualization.edit.tag' | 'delete'

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
        key: 'virtualization.create.tag',
        name: intl.formatMessage({ id: 'virtualization.create.tag', defaultMessage: 'New Tag' }),
        auth: {
          authKey: 'virtualization.create.tag',
          resource: 'tag',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'virtualization.bind.resource',
        name: intl.formatMessage({ id: 'virtualization.bind.resource', defaultMessage: 'Attach Resource' }),
        auth: {
          authKey: 'virtualization.bind.resource',
          resource: 'tag',
          type: 'action'
        },
      },
      {
        key: 'virtualization.edit.tag',
        name: intl.formatMessage({ id: 'virtualization.edit.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'virtualization.edit.tag',
          resource: 'tag',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'tag',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.virtualization/header': {
        extraKeys: [],
        activeKeys: ['virtualization.bind.resource', 'virtualization.edit.tag', 'delete'],
      },
      'main.virtualization/row': {
        extraKeys: [],
        activeKeys: ['virtualization.bind.resource', 'virtualization.edit.tag', 'delete'],
      },
      'main.virtualization/toolbar': {
        extraKeys: ['virtualization.create.tag'],
        activeKeys: ['virtualization.bind.resource', 'delete'],
      },
      'main/header': {
        extraKeys: [],
        activeKeys: ['delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['delete'],
      },
      'main/toolbar': {
        extraKeys: [],
        activeKeys: ['delete'],
      },
      'sub.create/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.create/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('tag', intl).then(remoteConfig => {
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
