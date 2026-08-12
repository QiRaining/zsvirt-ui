import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.stack.template' | 'edit' | 'enable' | 'disable' | 'generate.resource.stack' | 'modify' | 'set.share.type' | 'delete' | 'cancel.share'

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
        key: 'create.stack.template',
        name: intl.formatMessage({ id: 'create.resourceStackTemplate', defaultMessage: 'Create Stack Template' }),
        auth: {
          authKey: 'create.stack.template',
          resource: 'stack.template',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'stack.template',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'stack.template',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'stack.template',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'disable-divider',
        divider: true,
      },
      {
        key: 'generate.resource.stack',
        name: intl.formatMessage({ id: 'generate.resourceStack', defaultMessage: 'Generate Resource Stack' }),
        auth: {
          authKey: 'generate.resource.stack',
          resource: 'stack.template',
          type: 'action'
        },
      },
      {
        key: 'modify',
        name: intl.formatMessage({ id: 'modify', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'modify',
          resource: 'stack.template',
          type: 'action'
        },
      },
      {
        key: 'set.share.type',
        name: intl.formatMessage({ id: 'set.share', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'set.share.type',
          resource: 'stack.template',
          type: 'action'
        },
      },
      {
        key: 'set.share.type-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'stack.template',
          type: 'action'
        },
      },
      {
        key: 'cancel.share',
        name: intl.formatMessage({ id: 'cancel.share', defaultMessage: 'Unshare' }),
        auth: {
          authKey: 'cancel.share',
          resource: 'stack.template',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.share/header': {
        extraKeys: [],
        activeKeys: ['generate.resource.stack'],
      },
      'main.share/row': {
        extraKeys: [],
        activeKeys: ['generate.resource.stack'],
      },
      'main.share/toolbar': {
        extraKeys: [],
        activeKeys: ['generate.resource.stack'],
      },
      'main/header': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['edit', 'generate.resource.stack', 'modify', 'set.share.type', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'generate.resource.stack', 'modify', 'set.share.type', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.stack.template', 'enable', 'disable'],
        activeKeys: ['set.share.type', 'delete'],
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
        activeKeys: ['enable', 'disable', 'generate.resource.stack', 'modify', 'set.share.type', 'delete'],
      },
      'sub/toolbar': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['generate.resource.stack', 'modify', 'set.share.type', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('stack-template', intl).then(remoteConfig => {
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
