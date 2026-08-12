import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'add.mdsNode' | 'modify.ssh.port' | 'modify.ssh.username' | 'change.sshPassword' | 'modify.ssh.info' | 'delete.mdsNode'

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
        key: 'add.mdsNode',
        name: intl.formatMessage({ id: 'add.mdsNode', defaultMessage: 'Add MDS Node' }),
        auth: {
          authKey: 'add.mdsNode',
          resource: 'zbs.mds',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'modify.ssh.port',
        name: intl.formatMessage({ id: 'virtualization.modify.ssh.port', defaultMessage: 'Modify SSH Port' }),
        auth: {
          authKey: 'modify.ssh.port',
          resource: 'zbs.mds',
          type: 'action'
        },
      },
      {
        key: 'modify.ssh.username',
        name: intl.formatMessage({ id: 'virtualization.modify.ssh.username', defaultMessage: 'Modify SSH Username' }),
        auth: {
          authKey: 'modify.ssh.username',
          resource: 'zbs.mds',
          type: 'action'
        },
      },
      {
        key: 'change.sshPassword',
        name: intl.formatMessage({ id: 'virtualization.change.sshPassword', defaultMessage: 'Modify SSH Password' }),
        auth: {
          authKey: 'change.sshPassword',
          resource: 'zbs.mds',
          type: 'action'
        },
      },
      {
        key: 'change.sshPassword-divider',
        divider: true,
      },
      {
        key: 'modify.ssh.info',
        name: intl.formatMessage({ id: 'modify.ssh.info', defaultMessage: 'Modify SSH Information' }),
        auth: {
          authKey: 'modify.ssh.info',
          resource: 'zbs.mds',
          type: 'action'
        },
      },
      {
        key: 'modify.ssh.info-divider',
        divider: true,
      },
      {
        key: 'delete.mdsNode',
        name: intl.formatMessage({ id: 'virtualization.delete.mdsNode', defaultMessage: 'Delete MDS Node' }),
        auth: {
          authKey: 'delete.mdsNode',
          resource: 'zbs.mds',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'virtualization.main/row': {
        extraKeys: [],
        activeKeys: ['modify.ssh.info', 'delete.mdsNode'],
      },
      'virtualization.main/toolbar': {
        extraKeys: ['add.mdsNode', 'delete.mdsNode'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('zbs-mds', intl).then(remoteConfig => {
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
