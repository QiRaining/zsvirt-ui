import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create' | 'edit' | 'bind.vm' | 'unbind.vm' | 'attach.tag' | 'detach.tag' | 'delete'

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
        name: intl.formatMessage({ id: 'create.sshKeyPair', defaultMessage: 'Create SSH Key' }),
        auth: {
          authKey: 'create',
          resource: 'ssh.key.pair',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'ssh.key.pair',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'bind.vm',
        name: intl.formatMessage({ id: 'bind.vm', defaultMessage: 'Associate Virtual Machine' }),
        auth: {
          authKey: 'bind.vm',
          resource: 'ssh.key.pair',
          type: 'action'
        },
      },
      {
        key: 'unbind.vm',
        name: intl.formatMessage({ id: 'unbind.vm', defaultMessage: 'Disassociate Virtual Machine' }),
        auth: {
          authKey: 'unbind.vm',
          resource: 'ssh.key.pair',
          type: 'action'
        },
      },
      {
        key: 'attach.tag',
        name: intl.formatMessage({ id: 'attachTag', defaultMessage: 'Attach Tag' }),
        auth: {
          authKey: 'attach.tag',
          resource: 'ssh.key.pair',
          type: 'action'
        },
      },
      {
        key: 'detach.tag',
        name: intl.formatMessage({ id: 'detachTag', defaultMessage: 'Detach Tag' }),
        auth: {
          authKey: 'detach.tag',
          resource: 'ssh.key.pair',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'ssh.key.pair',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'bind.vm', 'unbind.vm', 'attach.tag', 'detach.tag', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'bind.vm', 'unbind.vm', 'attach.tag', 'detach.tag', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create', 'delete'],
        activeKeys: [],
      },
      'sub.create/toolbar': {
        extraKeys: ['create'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('ssh-key-pair', intl).then(remoteConfig => {
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
