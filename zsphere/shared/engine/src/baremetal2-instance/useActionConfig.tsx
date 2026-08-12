import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'edit' | 'create.baremetal2.instance' | 'start' | 'stop' | 'reboot' | 'force.stop' | 'reconnect.baremetal2.instance' | 'open.console' | 'tag' | 'attach.tag' | 'detach.tag' | 'attach.resource.tag' | 'detach.tag.in.tag.detail' | 'volume' | 'attach.volume' | 'detach.volume' | 'block.volume' | 'bm2.instance.attach.block.volume' | 'bm2.instance.detach.block.volume' | 'system.config' | 'replace.system' | 'update.system.password' | 'create.image' | 'create.snapshot' | 'delete' | 'recover' | 'expunge' | 'attach.in.volume' | 'detach.in.volume'

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
          resource: 'baremetal2.instance',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'create.baremetal2.instance',
        name: intl.formatMessage({ id: 'create.baremetal2Instance', defaultMessage: 'Create Elastic Baremetal Instance' }),
        auth: {
          authKey: 'create.baremetal2.instance',
          resource: 'baremetal2.instance',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'start',
        name: intl.formatMessage({ id: 'start', defaultMessage: 'Start' }),
        auth: {
          authKey: 'start',
          resource: 'baremetal2.instance',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'stop',
        name: intl.formatMessage({ id: 'stop', defaultMessage: 'Stop' }),
        auth: {
          authKey: 'stop',
          resource: 'baremetal2.instance',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'reboot',
        name: intl.formatMessage({ id: 'reboot', defaultMessage: 'Reboot' }),
        auth: {
          authKey: 'reboot',
          resource: 'baremetal2.instance',
          type: 'action'
        },
      },
      {
        key: 'force.stop',
        name: intl.formatMessage({ id: 'forceStop', defaultMessage: 'Power Off' }),
        auth: {
          authKey: 'force.stop',
          resource: 'baremetal2.instance',
          type: 'action'
        },
      },
      {
        key: 'reconnect.baremetal2.instance',
        name: intl.formatMessage({ id: 'reconnect.baremetal2.instance', defaultMessage: 'Obtain Status' }),
        auth: {
          authKey: 'reconnect.baremetal2.instance',
          resource: 'baremetal2.instance',
          type: 'action'
        },
      },
      {
        key: 'open.console',
        name: intl.formatMessage({ id: 'open.console', defaultMessage: 'Launch Console' }),
        auth: {
          authKey: 'open.console',
          resource: 'baremetal2.instance',
          type: 'action'
        },
      },
      {
        key: 'open.console-divider',
        divider: true,
      },
      {
        key: 'tag',
        name: intl.formatMessage({ id: 'tag', defaultMessage: 'Tag' }),
        children: [
          {
            key: 'attach.tag',
            name: intl.formatMessage({ id: 'attach.tag', defaultMessage: 'Attach Tag' }),
            auth: {
              authKey: 'attach.tag',
              resource: 'baremetal2.instance',
              type: 'action'
            },
          },
          {
            key: 'detach.tag',
            name: intl.formatMessage({ id: 'detach.tag', defaultMessage: 'Detach Tag' }),
            auth: {
              authKey: 'detach.tag',
              resource: 'baremetal2.instance',
              type: 'action'
            },
          },
          {
            key: 'detach.tag-divider',
            divider: true,
          },
          {
            key: 'attach.resource.tag',
            name: intl.formatMessage({ id: 'bind', defaultMessage: 'Associate' }),
            auth: {
              authKey: 'attach.resource.tag',
              resource: 'baremetal2.instance',
              type: 'action'
            },
          },
          {
            key: 'detach.tag.in.tag.detail',
            name: intl.formatMessage({ id: 'disassociate', defaultMessage: 'Disassociate' }),
            auth: {
              authKey: 'detach.tag.in.tag.detail',
              resource: 'baremetal2.instance',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'volume',
        name: intl.formatMessage({ id: 'volume', defaultMessage: 'Disk' }),
        children: [
          {
            key: 'attach.volume',
            name: intl.formatMessage({ id: 'attach.volume', defaultMessage: 'Attach Volume' }),
            auth: {
              authKey: 'attach.volume',
              resource: 'baremetal2.instance',
              type: 'action'
            },
          },
          {
            key: 'detach.volume',
            name: intl.formatMessage({ id: 'detach.volume', defaultMessage: 'Detach Disk' }),
            auth: {
              authKey: 'detach.volume',
              resource: 'baremetal2.instance',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'block.volume',
        name: intl.formatMessage({ id: 'block.volume', defaultMessage: 'Block Storage Disk' }),
        children: [
          {
            key: 'bm2.instance.attach.block.volume',
            name: intl.formatMessage({ id: 'bm2.instance.attach.block.volume', defaultMessage: 'Attach Block Storage Disk' }),
            auth: {
              authKey: 'bm2.instance.attach.block.volume',
              resource: 'baremetal2.instance',
              type: 'action'
            },
          },
          {
            key: 'bm2.instance.detach.block.volume',
            name: intl.formatMessage({ id: 'bm2.instance.detach.block.volume', defaultMessage: 'Detach Block Storage Disk' }),
            auth: {
              authKey: 'bm2.instance.detach.block.volume',
              resource: 'baremetal2.instance',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'system.config',
        name: intl.formatMessage({ id: 'system.config', defaultMessage: 'System Configuration' }),
        children: [
          {
            key: 'replace.system',
            name: intl.formatMessage({ id: 'replace.system', defaultMessage: 'Change System' }),
            auth: {
              authKey: 'replace.system',
              resource: 'baremetal2.instance',
              type: 'action'
            },
          },
          {
            key: 'update.system.password',
            name: intl.formatMessage({ id: 'update.systemPassword', defaultMessage: 'Modify Password for Elastic Baremetal Instance' }),
            auth: {
              authKey: 'update.system.password',
              resource: 'baremetal2.instance',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'create.image',
        name: intl.formatMessage({ id: 'create.image', defaultMessage: 'Create Image' }),
        auth: {
          authKey: 'create.image',
          resource: 'baremetal2.instance',
          type: 'action'
        },
      },
      {
        key: 'create.snapshot',
        name: intl.formatMessage({ id: 'create.snapshot', defaultMessage: 'Create Snapshot' }),
        auth: {
          authKey: 'create.snapshot',
          resource: 'baremetal2.instance',
          type: 'action'
        },
      },
      {
        key: 'create.snapshot-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'baremetal2.instance',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'recover',
        name: intl.formatMessage({ id: 'recover', defaultMessage: 'Recover' }),
        auth: {
          authKey: 'recover',
          resource: 'baremetal2.instance',
          type: 'action'
        },
        icon: 'undo',
      },
      {
        key: 'expunge',
        name: intl.formatMessage({ id: 'expunge', defaultMessage: 'Expunge' }),
        auth: {
          authKey: 'expunge',
          resource: 'baremetal2.instance',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'attach.in.volume',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.in.volume',
          resource: 'baremetal2.instance',
          type: 'action'
        },
      },
      {
        key: 'detach.in.volume',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.in.volume',
          resource: 'baremetal2.instance',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.destroyed/header': {
        extraKeys: ['recover', 'expunge'],
        activeKeys: [],
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
        extraKeys: ['start', 'stop'],
        activeKeys: ['edit', 'reboot', 'force.stop', 'reconnect.baremetal2.instance', 'open.console', 'tag', 'attach.tag', 'detach.tag', 'volume', 'attach.volume', 'detach.volume', 'block.volume', 'bm2.instance.attach.block.volume', 'bm2.instance.detach.block.volume', 'replace.system', 'update.system.password', 'create.image', 'create.snapshot', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'start', 'stop', 'reboot', 'force.stop', 'reconnect.baremetal2.instance', 'open.console', 'tag', 'attach.tag', 'detach.tag', 'volume', 'attach.volume', 'detach.volume', 'block.volume', 'bm2.instance.attach.block.volume', 'bm2.instance.detach.block.volume', 'replace.system', 'update.system.password', 'create.image', 'create.snapshot', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.baremetal2.instance', 'start', 'stop'],
        activeKeys: ['reboot', 'force.stop', 'reconnect.baremetal2.instance', 'attach.tag', 'delete'],
      },
      'sub.baremetal2Instance.tag/row': {
        extraKeys: [],
        activeKeys: ['detach.tag.in.tag.detail'],
      },
      'sub.baremetal2Instance.tag/toolbar': {
        extraKeys: ['attach.resource.tag', 'detach.tag.in.tag.detail'],
        activeKeys: [],
      },
      'sub.gateway/row': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'reboot', 'force.stop', 'reconnect.baremetal2.instance', 'open.console', 'tag', 'attach.tag', 'detach.tag', 'volume', 'attach.volume', 'detach.volume', 'block.volume', 'bm2.instance.attach.block.volume', 'bm2.instance.detach.block.volume', 'update.system.password', 'create.image', 'create.snapshot', 'delete'],
      },
      'sub.gateway/toolbar': {
        extraKeys: ['start', 'stop', 'delete'],
        activeKeys: [],
      },
      'sub.primary.storage/row': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'reboot', 'force.stop', 'delete'],
      },
      'sub.primary.storage/toolbar': {
        extraKeys: [],
        activeKeys: ['start', 'stop', 'reboot', 'force.stop', 'delete'],
      },
      'sub.tag/row': {
        extraKeys: [],
        activeKeys: ['detach.tag.in.tag.detail'],
      },
      'sub.tag/toolbar': {
        extraKeys: ['detach.tag.in.tag.detail'],
        activeKeys: [],
      },
      'sub.volume/row': {
        extraKeys: [],
        activeKeys: ['detach.in.volume'],
      },
      'sub.volume/toolbar': {
        extraKeys: ['attach.in.volume', 'detach.in.volume'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('baremetal2-instance', intl).then(remoteConfig => {
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
