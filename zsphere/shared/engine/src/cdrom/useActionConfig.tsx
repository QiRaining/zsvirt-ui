import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.cdrom' | 'attachIso' | 'detachIso' | 'set.default' | 'delete'

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
        key: 'create.cdrom',
        name: intl.formatMessage({ id: 'create.cdrom', defaultMessage: 'Create vDrive' }),
        auth: {
          authKey: 'create.cdrom',
          resource: 'cdrom',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'attachIso',
        name: intl.formatMessage({ id: 'attach.iso', defaultMessage: 'Attach ISO' }),
        auth: {
          authKey: 'attachIso',
          resource: 'cdrom',
          type: 'action'
        },
      },
      {
        key: 'detachIso',
        name: intl.formatMessage({ id: 'detach.iso', defaultMessage: 'Detach ISO' }),
        auth: {
          authKey: 'detachIso',
          resource: 'cdrom',
          type: 'action'
        },
      },
      {
        key: 'set.default',
        name: intl.formatMessage({ id: 'set.defaultCdrom', defaultMessage: 'Set as Default Drive' }),
        auth: {
          authKey: 'set.default',
          resource: 'cdrom',
          type: 'action'
        },
      },
      {
        key: 'set.default-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete.cdrom', defaultMessage: 'Delete vDrive' }),
        auth: {
          authKey: 'delete',
          resource: 'cdrom',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['attachIso', 'detachIso', 'set.default', 'delete'],
      },
      'sub/toolbar': {
        extraKeys: ['create.cdrom'],
        activeKeys: ['detachIso', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('cdrom', intl).then(remoteConfig => {
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
