import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'se.attachvm' | 'se.detachvm' | 'se.delete' | 'se.attach' | 'se.detach' | 'se.create'

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
        key: 'se.attachvm',
        name: intl.formatMessage({ id: 'attach.vm', defaultMessage: 'Attach Virtual Machine' }),
        auth: {
          authKey: 'se.attachvm',
          resource: 'se',
          type: 'action'
        },
      },
      {
        key: 'se.detachvm',
        name: intl.formatMessage({ id: 'detach.vm', defaultMessage: 'Detach Virtual Machine' }),
        auth: {
          authKey: 'se.detachvm',
          resource: 'se',
          type: 'action'
        },
      },
      {
        key: 'se.delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'se.delete',
          resource: 'se',
          type: 'action'
        },
      },
      {
        key: 'se.attach',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'se.attach',
          resource: 'se',
          type: 'action'
        },
      },
      {
        key: 'se.detach',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'se.detach',
          resource: 'se',
          type: 'action'
        },
      },
      {
        key: 'se.create',
        name: intl.formatMessage({ id: 'se.create', defaultMessage: 'Create SE Device' }),
        auth: {
          authKey: 'se.create',
          resource: 'se',
          type: 'action'
        },
        icon: 'plus',
      },
    ],

    viewMap: {
      'main/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.host/row': {
        extraKeys: [],
        activeKeys: ['se.attachvm', 'se.detachvm', 'se.delete'],
      },
      'sub.host/toolbar': {
        extraKeys: ['se.create'],
        activeKeys: ['se.detachvm', 'se.delete'],
      },
      'sub.vm/row': {
        extraKeys: [],
        activeKeys: ['se.detach'],
      },
      'sub.vm/toolbar': {
        extraKeys: ['se.attach'],
        activeKeys: ['se.detach'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('se', intl).then(remoteConfig => {
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
