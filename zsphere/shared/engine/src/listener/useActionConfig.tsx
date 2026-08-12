import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'edit' | 'create.listener' | 'attach.certificate' | 'detach.certifacate' | 'sessionPersistence' | 'listener.changeAdvance' | 'attach.serverGroup' | 'detach.serverGroup' | 'add.acl' | 'delete' | 'detach.listener' | 'attach.alarm' | 'detach.alarm'

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
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'listener',
          type: 'action'
        },
      },
      {
        key: 'edit-divider',
        divider: true,
      },
      {
        key: 'create.listener',
        name: intl.formatMessage({ id: 'create.listener', defaultMessage: 'Create Listener' }),
        auth: {
          authKey: 'create.listener',
          resource: 'listener',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'attach.certificate',
        name: intl.formatMessage({ id: 'attach.certificate', defaultMessage: 'Bind Certificate' }),
        auth: {
          authKey: 'attach.certificate',
          resource: 'listener',
          type: 'action'
        },
      },
      {
        key: 'detach.certifacate',
        name: intl.formatMessage({ id: 'detach.certifacate', defaultMessage: 'Disassociate Certificate' }),
        auth: {
          authKey: 'detach.certifacate',
          resource: 'listener',
          type: 'action'
        },
      },
      {
        key: 'sessionPersistence',
        name: intl.formatMessage({ id: 'set.basic.config', defaultMessage: 'Modify Basic Settings' }),
        auth: {
          authKey: 'sessionPersistence',
          resource: 'listener',
          type: 'action'
        },
      },
      {
        key: 'listener.changeAdvance',
        name: intl.formatMessage({ id: 'listener.changeAdvance', defaultMessage: 'Modify Advanced Settings' }),
        auth: {
          authKey: 'listener.changeAdvance',
          resource: 'listener',
          type: 'action'
        },
      },
      {
        key: 'attach.serverGroup',
        name: intl.formatMessage({ id: 'attach.serverGroup', defaultMessage: 'Attach Backend Server Group' }),
        auth: {
          authKey: 'attach.serverGroup',
          resource: 'listener',
          type: 'action'
        },
      },
      {
        key: 'detach.serverGroup',
        name: intl.formatMessage({ id: 'detach.serverGroup', defaultMessage: 'Disassociate Backend Server Group' }),
        auth: {
          authKey: 'detach.serverGroup',
          resource: 'listener',
          type: 'action'
        },
      },
      {
        key: 'add.acl',
        name: intl.formatMessage({ id: 'add.acl', defaultMessage: 'Configure Forwarding Rules' }),
        auth: {
          authKey: 'add.acl',
          resource: 'listener',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'listener',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'delete-divider',
        divider: true,
      },
      {
        key: 'detach.listener',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.listener',
          resource: 'listener',
          type: 'action'
        },
      },
      {
        key: 'attach.alarm',
        name: intl.formatMessage({ id: 'add', defaultMessage: 'Add' }),
        auth: {
          authKey: 'attach.alarm',
          resource: 'listener',
          type: 'action'
        },
      },
      {
        key: 'detach.alarm',
        name: intl.formatMessage({ id: 'remove', defaultMessage: 'Remove' }),
        auth: {
          authKey: 'detach.alarm',
          resource: 'listener',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'attach.certificate', 'detach.certifacate', 'sessionPersistence', 'listener.changeAdvance', 'attach.serverGroup', 'detach.serverGroup', 'add.acl', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'attach.certificate', 'detach.certifacate', 'sessionPersistence', 'listener.changeAdvance', 'attach.serverGroup', 'detach.serverGroup', 'add.acl', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.listener'],
        activeKeys: ['attach.certificate', 'detach.certifacate', 'delete'],
      },
      'sub.alarm/row': {
        extraKeys: ['detach.alarm'],
        activeKeys: [],
      },
      'sub.alarm/toolbar': {
        extraKeys: ['attach.alarm', 'detach.alarm'],
        activeKeys: [],
      },
      'sub.certificate/row': {
        extraKeys: ['detach.listener'],
        activeKeys: [],
      },
      'sub.certificate/toolbar': {
        extraKeys: ['detach.listener'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['edit', 'attach.certificate', 'detach.certifacate', 'sessionPersistence', 'listener.changeAdvance', 'attach.serverGroup', 'detach.serverGroup', 'add.acl', 'delete'],
      },
      'sub/toolbar': {
        extraKeys: ['create.listener'],
        activeKeys: ['attach.certificate', 'detach.certifacate', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('listener', intl).then(remoteConfig => {
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
