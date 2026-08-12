import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'primary.storage.add.ceph.mon' | 'primary.storage.modify.ssh.username' | 'primary.storage.modify.ssh.password' | 'primary.storage.modify.ssh.port' | 'primary.storage.modify.mon.port' | 'primary.storage.delete.ceph.mon' | 'backup.storage.add.ceph.mon' | 'backup.storage.modify.ssh.username' | 'backup.storage.modify.ssh.password' | 'backup.storage.modify.ssh.port' | 'backup.storage.modify.mon.port' | 'backup.storage.delete.ceph.mon' | 'modify.config'

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
        key: 'primary.storage.add.ceph.mon',
        name: intl.formatMessage({ id: 'add.monNode', defaultMessage: 'Add Monitoring Node' }),
        auth: {
          authKey: 'primary.storage.add.ceph.mon',
          resource: 'primary.storage',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'primary.storage.modify.ssh.username',
        name: intl.formatMessage({ id: 'change.sshUsername', defaultMessage: 'Modify SSH Username' }),
        auth: {
          authKey: 'primary.storage.modify.ssh.username',
          resource: 'primary.storage',
          type: 'action'
        },
      },
      {
        key: 'primary.storage.modify.ssh.password',
        name: intl.formatMessage({ id: 'change.sshPassword', defaultMessage: 'Modify SSH Password' }),
        auth: {
          authKey: 'primary.storage.modify.ssh.password',
          resource: 'primary.storage',
          type: 'action'
        },
      },
      {
        key: 'primary.storage.modify.ssh.port',
        name: intl.formatMessage({ id: 'change.sshPort', defaultMessage: 'Edit SSH Port' }),
        auth: {
          authKey: 'primary.storage.modify.ssh.port',
          resource: 'primary.storage',
          type: 'action'
        },
      },
      {
        key: 'primary.storage.modify.mon.port',
        name: intl.formatMessage({ id: 'change.monPort', defaultMessage: 'Modify Mon Port' }),
        auth: {
          authKey: 'primary.storage.modify.mon.port',
          resource: 'primary.storage',
          type: 'action'
        },
      },
      {
        key: 'primary.storage.delete.ceph.mon',
        name: intl.formatMessage({ id: 'delete.monNode', defaultMessage: 'Delete Monitoring Node' }),
        auth: {
          authKey: 'primary.storage.delete.ceph.mon',
          resource: 'primary.storage',
          type: 'action'
        },
      },
      {
        key: 'backup.storage.add.ceph.mon',
        name: intl.formatMessage({ id: 'add.monNode', defaultMessage: 'Add Monitoring Node' }),
        auth: {
          authKey: 'backup.storage.add.ceph.mon',
          resource: 'backup.storage',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'backup.storage.modify.ssh.username',
        name: intl.formatMessage({ id: 'change.sshUsername', defaultMessage: 'Modify SSH Username' }),
        auth: {
          authKey: 'backup.storage.modify.ssh.username',
          resource: 'backup.storage',
          type: 'action'
        },
      },
      {
        key: 'backup.storage.modify.ssh.password',
        name: intl.formatMessage({ id: 'change.sshPassword', defaultMessage: 'Modify SSH Password' }),
        auth: {
          authKey: 'backup.storage.modify.ssh.password',
          resource: 'backup.storage',
          type: 'action'
        },
      },
      {
        key: 'backup.storage.modify.ssh.port',
        name: intl.formatMessage({ id: 'change.sshPort', defaultMessage: 'Edit SSH Port' }),
        auth: {
          authKey: 'backup.storage.modify.ssh.port',
          resource: 'backup.storage',
          type: 'action'
        },
      },
      {
        key: 'backup.storage.modify.mon.port',
        name: intl.formatMessage({ id: 'change.monPort', defaultMessage: 'Modify Mon Port' }),
        auth: {
          authKey: 'backup.storage.modify.mon.port',
          resource: 'backup.storage',
          type: 'action'
        },
      },
      {
        key: 'backup.storage.delete.ceph.mon',
        name: intl.formatMessage({ id: 'delete.monNode', defaultMessage: 'Delete Monitoring Node' }),
        auth: {
          authKey: 'backup.storage.delete.ceph.mon',
          resource: 'backup.storage',
          type: 'action'
        },
      },
      {
        key: 'modify.config',
        name: intl.formatMessage({ id: 'modify.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'modify.config',
          resource: 'ceph.mon',
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
      'sub.backup.storage/row': {
        extraKeys: [],
        activeKeys: ['backup.storage.modify.ssh.username', 'backup.storage.modify.ssh.password', 'backup.storage.modify.ssh.port', 'backup.storage.modify.mon.port', 'backup.storage.delete.ceph.mon'],
      },
      'sub.backup.storage/toolbar': {
        extraKeys: ['backup.storage.add.ceph.mon', 'backup.storage.delete.ceph.mon'],
        activeKeys: [],
      },
      'sub.primary.storage/row': {
        extraKeys: [],
        activeKeys: ['primary.storage.modify.ssh.username', 'primary.storage.modify.ssh.password', 'primary.storage.modify.ssh.port', 'primary.storage.modify.mon.port', 'primary.storage.delete.ceph.mon'],
      },
      'sub.primary.storage/toolbar': {
        extraKeys: ['primary.storage.add.ceph.mon', 'primary.storage.delete.ceph.mon'],
        activeKeys: [],
      },
      'sub.virtualization.backup-storage/row': {
        extraKeys: [],
        activeKeys: ['backup.storage.modify.ssh.username', 'backup.storage.modify.ssh.password', 'backup.storage.modify.ssh.port', 'backup.storage.modify.mon.port', 'backup.storage.delete.ceph.mon'],
      },
      'sub.virtualization.backup-storage/toolbar': {
        extraKeys: ['primary.storage.add.ceph.mon', 'backup.storage.delete.ceph.mon'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('ceph-mon', intl).then(remoteConfig => {
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
