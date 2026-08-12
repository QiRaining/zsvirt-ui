import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.emailServerSetting' | 'start' | 'stop' | 'edit' | 'validate' | 'changeOwner' | 'set.share.mode' | 'delete' | 'cancel.share'

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
        key: 'create.emailServerSetting',
        name: intl.formatMessage({ id: 'add.emailServer', defaultMessage: 'Add Email Server' }),
        auth: {
          authKey: 'create.emailServerSetting',
          resource: 'email.server',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'start',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'start',
          resource: 'email.server',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'stop',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'stop',
          resource: 'email.server',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'stop-divider',
        divider: true,
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'email.server',
          type: 'action'
        },
      },
      {
        key: 'validate',
        name: intl.formatMessage({ id: 'test', defaultMessage: 'Test' }),
        auth: {
          authKey: 'validate',
          resource: 'email.server',
          type: 'action'
        },
      },
      {
        key: 'validate-divider',
        divider: true,
      },
      {
        key: 'changeOwner',
        name: intl.formatMessage({ id: 'change.owner', defaultMessage: 'Change Owner' }),
        auth: {
          authKey: 'changeOwner',
          resource: 'email.server',
          type: 'action'
        },
      },
      {
        key: 'set.share.mode',
        name: intl.formatMessage({ id: 'set.share.mode', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'set.share.mode',
          resource: 'email.server',
          type: 'action'
        },
      },
      {
        key: 'set.share.mode-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'email.server',
          type: 'action'
        },
      },
      {
        key: 'cancel.share',
        name: intl.formatMessage({ id: 'cancel.share', defaultMessage: 'Unshare' }),
        auth: {
          authKey: 'cancel.share',
          resource: 'email.server',
          type: 'action'
        },
      },
      {
        key: 'cancel.share-divider',
        divider: true,
      },
    ],

    viewMap: {
      'main.selfhave/header': {
        extraKeys: ['start', 'stop'],
        activeKeys: ['edit', 'validate', 'changeOwner', 'delete'],
      },
      'main.selfhave/row': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'edit', 'validate', 'changeOwner', 'delete'],
      },
      'main.selfhave/toolbar': {
        extraKeys: ['create.emailServerSetting', 'start', 'stop'],
        activeKeys: ['validate', 'changeOwner', 'delete'],
      },
      'main.share/header': {
        extraKeys: ['validate'],
        activeKeys: [],
      },
      'main.share/row': {
        extraKeys: ['validate'],
        activeKeys: [],
      },
      'main.share/toolbar': {
        extraKeys: ['validate'],
        activeKeys: [],
      },
      'main.virtualization.selfhave/header': {
        extraKeys: ['start', 'stop'],
        activeKeys: ['edit', 'validate', 'delete'],
      },
      'main.virtualization.selfhave/row': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'edit', 'validate', 'delete'],
      },
      'main.virtualization.selfhave/toolbar': {
        extraKeys: ['create.emailServerSetting', 'start', 'stop'],
        activeKeys: ['validate', 'delete'],
      },
      'main.virtualization.share/header': {
        extraKeys: ['validate'],
        activeKeys: [],
      },
      'main.virtualization.share/row': {
        extraKeys: [],
        activeKeys: ['validate'],
      },
      'main.virtualization.share/toolbar': {
        extraKeys: ['validate'],
        activeKeys: [],
      },
      'main.virtualization/header': {
        extraKeys: ['start', 'stop'],
        activeKeys: ['edit', 'validate', 'changeOwner', 'set.share.mode', 'delete'],
      },
      'main.virtualization/row': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'edit', 'validate', 'changeOwner', 'set.share.mode', 'delete'],
      },
      'main.virtualization/toolbar': {
        extraKeys: ['create.emailServerSetting', 'start', 'stop'],
        activeKeys: ['validate', 'changeOwner', 'set.share.mode', 'delete'],
      },
      'main/header': {
        extraKeys: ['start', 'stop'],
        activeKeys: ['edit', 'validate', 'changeOwner', 'set.share.mode', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'edit', 'validate', 'changeOwner', 'set.share.mode', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.emailServerSetting', 'start', 'stop'],
        activeKeys: ['validate', 'changeOwner', 'set.share.mode', 'delete'],
      },
      'sub.shared.resource/row': {
        extraKeys: ['cancel.share'],
        activeKeys: [],
      },
      'sub.shared.resource/toolbar': {
        extraKeys: ['cancel.share'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'delete'],
      },
      'sub/toolbar': {
        extraKeys: ['create.emailServerSetting'],
        activeKeys: ['start', 'stop', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('email-server', intl).then(remoteConfig => {
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
