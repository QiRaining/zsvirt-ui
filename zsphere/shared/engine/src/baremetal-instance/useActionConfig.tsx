import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'creat.baremetal.instance' | 'start' | 'stop' | 'rebort' | 'open.console' | 'edit' | 'virtualization.tag.and.attribute' | 'tag.management' | 'virtualization.set.resource.attribute' | 'delete' | 'recover' | 'expunge' | 'attach.alarm' | 'detach.alarm'

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
        key: 'creat.baremetal.instance',
        name: intl.formatMessage({ id: 'create.baremetalInstance', defaultMessage: 'New Bare Metal Instance' }),
        auth: {
          authKey: 'creat.baremetal.instance',
          resource: 'baremetal.instance',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'start',
        name: intl.formatMessage({ id: 'start', defaultMessage: 'Start' }),
        auth: {
          authKey: 'start',
          resource: 'baremetal.instance',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'stop',
        name: intl.formatMessage({ id: 'stop', defaultMessage: 'Stop' }),
        auth: {
          authKey: 'stop',
          resource: 'baremetal.instance',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'rebort',
        name: intl.formatMessage({ id: 'rebort', defaultMessage: 'Reboot' }),
        auth: {
          authKey: 'rebort',
          resource: 'baremetal.instance',
          type: 'action'
        },
      },
      {
        key: 'rebort-divider',
        divider: true,
      },
      {
        key: 'open.console',
        name: intl.formatMessage({ id: 'open.console', defaultMessage: 'Launch Console' }),
        auth: {
          authKey: 'open.console',
          resource: 'baremetal.instance',
          type: 'action'
        },
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit.name.and.desc', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'edit',
          resource: 'baremetal.instance',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'virtualization.tag.and.attribute',
        name: intl.formatMessage({ id: 'virtualization.tag.and.attribute', defaultMessage: 'Tag and Attribute' }),
        children: [
          {
            key: 'tag.management',
            name: intl.formatMessage({ id: 'tag.management', defaultMessage: 'Tag Management' }),
            auth: {
              authKey: 'tag.management',
              resource: 'baremetal.instance',
              type: 'action'
            },
          },
          {
            key: 'virtualization.set.resource.attribute',
            name: intl.formatMessage({ id: 'set.resource.attribute', defaultMessage: 'Set Custom Attribute' }),
            auth: {
              authKey: 'virtualization.set.resource.attribute',
              resource: 'baremetal.instance',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'virtualization.tag.and.attribute-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'baremetal.instance',
          type: 'action'
        },
      },
      {
        key: 'recover',
        name: intl.formatMessage({ id: 'recover', defaultMessage: 'Recover' }),
        auth: {
          authKey: 'recover',
          resource: 'baremetal.instance',
          type: 'action'
        },
      },
      {
        key: 'expunge',
        name: intl.formatMessage({ id: 'expunge', defaultMessage: 'Expunge' }),
        auth: {
          authKey: 'expunge',
          resource: 'baremetal.instance',
          type: 'action'
        },
      },
      {
        key: 'attach.alarm',
        name: intl.formatMessage({ id: 'add', defaultMessage: 'Add' }),
        auth: {
          authKey: 'attach.alarm',
          resource: 'baremetal.instance',
          type: 'action'
        },
      },
      {
        key: 'detach.alarm',
        name: intl.formatMessage({ id: 'remove', defaultMessage: 'Remove' }),
        auth: {
          authKey: 'detach.alarm',
          resource: 'baremetal.instance',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.destroyed/header': {
        extraKeys: [],
        activeKeys: ['recover', 'expunge'],
      },
      'main.destroyed/row': {
        extraKeys: [],
        activeKeys: ['recover', 'expunge'],
      },
      'main.destroyed/toolbar': {
        extraKeys: ['recover', 'expunge'],
        activeKeys: [],
      },
      'main/header': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'rebort', 'open.console', 'edit', 'virtualization.tag.and.attribute', 'tag.management', 'virtualization.set.resource.attribute', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'rebort', 'open.console', 'edit', 'virtualization.tag.and.attribute', 'tag.management', 'virtualization.set.resource.attribute', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['creat.baremetal.instance', 'start', 'stop'],
        activeKeys: ['rebort', 'virtualization.tag.and.attribute', 'tag.management', 'virtualization.set.resource.attribute', 'delete'],
      },
      'sub.alarm/row': {
        extraKeys: [],
        activeKeys: ['detach.alarm'],
      },
      'sub.alarm/toolbar': {
        extraKeys: ['attach.alarm', 'detach.alarm'],
        activeKeys: [],
      },
      'sub.baremetal.cluster/row': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'rebort', 'open.console', 'edit', 'virtualization.tag.and.attribute', 'tag.management', 'virtualization.set.resource.attribute', 'delete'],
      },
      'sub.baremetal.cluster/toolbar': {
        extraKeys: ['creat.baremetal.instance', 'start', 'stop'],
        activeKeys: ['rebort', 'virtualization.tag.and.attribute', 'tag.management', 'virtualization.set.resource.attribute', 'delete'],
      },
      'sub.baremetalInstance.tag/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.baremetalInstance.tag/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.tag/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.tag/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'virtualization.dir/directory': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'rebort', 'open.console', 'edit', 'virtualization.tag.and.attribute', 'tag.management', 'virtualization.set.resource.attribute', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('baremetal-instance', intl).then(remoteConfig => {
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
