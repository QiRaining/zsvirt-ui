import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.instance' | 'transform.to.instance' | 'edit' | 'edit.config' | 'set.share.type' | 'change.owner' | 'delete' | 'share.resource' | 'cancel.share'

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
        key: 'create.instance',
        name: intl.formatMessage({ id: 'create.instance', defaultMessage: 'New Virtual Machine' }),
        auth: {
          authKey: 'create.instance',
          resource: 'vm.template',
          type: 'action'
        },
      },
      {
        key: 'transform.to.instance',
        name: intl.formatMessage({ id: 'transform.to.instance', defaultMessage: 'Convert to Virtual Machine' }),
        auth: {
          authKey: 'transform.to.instance',
          resource: 'vm.template',
          type: 'action'
        },
      },
      {
        key: 'transform.to.instance-divider',
        divider: true,
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit.name.and.desc', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'edit',
          resource: 'vm.template',
          type: 'action'
        },
      },
      {
        key: 'edit.config',
        name: intl.formatMessage({ id: 'edit.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'edit.config',
          resource: 'vm.template',
          type: 'action'
        },
      },
      {
        key: 'set.share.type',
        name: intl.formatMessage({ id: 'set.share.type', defaultMessage: 'Set Sharing Mode' }),
        auth: {
          authKey: 'set.share.type',
          resource: 'vm.template',
          type: 'action'
        },
      },
      {
        key: 'change.owner',
        name: intl.formatMessage({ id: 'change.owner', defaultMessage: 'Change Owner' }),
        auth: {
          authKey: 'change.owner',
          resource: 'vm.template',
          type: 'action'
        },
      },
      {
        key: 'change.owner-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'vm.template',
          type: 'action'
        },
      },
      {
        key: 'share.resource',
        name: intl.formatMessage({ id: 'share.resource', defaultMessage: 'Share Resource' }),
        auth: {
          authKey: 'share.resource',
          resource: 'vm.template',
          type: 'action'
        },
      },
      {
        key: 'cancel.share',
        name: intl.formatMessage({ id: 'cancel.share', defaultMessage: 'Unshare' }),
        auth: {
          authKey: 'cancel.share',
          resource: 'vm.template',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/directory': {
        extraKeys: [],
        activeKeys: ['create.instance', 'transform.to.instance', 'edit', 'edit.config', 'set.share.type', 'change.owner', 'delete'],
      },
      'main/header': {
        extraKeys: [],
        activeKeys: ['create.instance', 'transform.to.instance', 'edit', 'edit.config', 'set.share.type', 'change.owner', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['create.instance', 'transform.to.instance', 'edit', 'edit.config', 'set.share.type', 'change.owner', 'delete'],
      },
      'main/toolbar': {
        extraKeys: [],
        activeKeys: ['set.share.type', 'change.owner', 'delete'],
      },
      'sub.zsv.shared.resource/row': {
        extraKeys: [],
        activeKeys: ['create.instance', 'transform.to.instance', 'edit', 'edit.config', 'set.share.type', 'change.owner', 'delete', 'cancel.share'],
      },
      'sub.zsv.shared.resource/toolbar': {
        extraKeys: ['share.resource', 'cancel.share'],
        activeKeys: [],
      },
      'virtualization.dir/directory': {
        extraKeys: [],
        activeKeys: ['create.instance', 'transform.to.instance', 'edit', 'edit.config', 'set.share.type', 'change.owner', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('vm-template', intl).then(remoteConfig => {
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
