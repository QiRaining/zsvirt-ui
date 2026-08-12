import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'edit' | 'create.volume' | 'vm.create.volume' | 'baremetal2Instance.create.volume' | 'enable' | 'disable' | 'vm.attach.volume' | 'vm.detach.volume' | 'baremetal2Instance.attach.volume' | 'baremetal2Instance.detach.volume' | 'volume.attach' | 'volume.detach' | 'migrate' | 'volume.migrate' | 'volume.storage.migrate' | 'change.owner' | 'resize.data.volume' | 'resize.baremetal2.instance.data.volume' | 'tag' | 'attach.tag' | 'detach.tag' | 'backup' | 'create.backup.volume' | 'volume.bind.backup.task' | 'volume.create.image' | 'volume.create.snapshot' | 'set.root.volume' | 'volume.set.qos' | 'volume.flatten' | 'delete' | 'move.to.recycle.bin' | 'recover' | 'expunge' | 'attach.resource.tag' | 'detach.resource.tag' | 'backup.job.attach.volume' | 'backup.job.detach.volume' | 'detached.volume.attach.vm' | 'backup.task.enable' | 'backup.task.disable'

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
          resource: 'volume',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'create.volume',
        name: intl.formatMessage({ id: 'create.volume', defaultMessage: 'Create Volume' }),
        auth: {
          authKey: 'create.volume',
          resource: 'volume',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'vm.create.volume',
        name: intl.formatMessage({ id: 'create.volume', defaultMessage: 'Create Volume' }),
        auth: {
          authKey: 'vm.create.volume',
          resource: 'volume',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'baremetal2Instance.create.volume',
        name: intl.formatMessage({ id: 'create.volume', defaultMessage: 'Create Volume' }),
        auth: {
          authKey: 'baremetal2Instance.create.volume',
          resource: 'volume',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'volume',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'volume',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'vm.attach.volume',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'vm.attach.volume',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'vm.detach.volume',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'vm.detach.volume',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'baremetal2Instance.attach.volume',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'baremetal2Instance.attach.volume',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'baremetal2Instance.detach.volume',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'baremetal2Instance.detach.volume',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'volume.attach',
        name: intl.formatMessage({ id: 'attach.instance', defaultMessage: 'Attach Instance' }),
        auth: {
          authKey: 'volume.attach',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'volume.detach',
        name: intl.formatMessage({ id: 'detach.instance', defaultMessage: 'Detach Instance' }),
        auth: {
          authKey: 'volume.detach',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'volume.detach-divider',
        divider: true,
      },
      {
        key: 'migrate',
        name: intl.formatMessage({ id: 'migrate', defaultMessage: 'Migrate' }),
        children: [
          {
            key: 'volume.migrate',
            name: intl.formatMessage({ id: 'volume.migrate.change.host', defaultMessage: 'Change Host' }),
            auth: {
              authKey: 'volume.migrate',
              resource: 'volume',
              type: 'action'
            },
          },
          {
            key: 'volume.storage.migrate',
            name: intl.formatMessage({ id: 'volume.migrate.change.primaryStorage', defaultMessage: 'Change Data Storage' }),
            auth: {
              authKey: 'volume.storage.migrate',
              resource: 'volume',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'change.owner',
        name: intl.formatMessage({ id: 'change.owner', defaultMessage: 'Change Owner' }),
        auth: {
          authKey: 'change.owner',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'resize.data.volume',
        name: intl.formatMessage({ id: 'resize.volume', defaultMessage: 'Resize Volume' }),
        auth: {
          authKey: 'resize.data.volume',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'resize.data.volume-divider',
        divider: true,
      },
      {
        key: 'resize.baremetal2.instance.data.volume',
        name: intl.formatMessage({ id: 'resize.volume', defaultMessage: 'Resize Volume' }),
        auth: {
          authKey: 'resize.baremetal2.instance.data.volume',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'resize.baremetal2.instance.data.volume-divider',
        divider: true,
      },
      {
        key: 'tag',
        name: intl.formatMessage({ id: 'tag', defaultMessage: 'Tag' }),
        children: [
          {
            key: 'attach.tag',
            name: intl.formatMessage({ id: 'bind.tag', defaultMessage: 'Attach Tag' }),
            auth: {
              authKey: 'attach.tag',
              resource: 'volume',
              type: 'action'
            },
          },
          {
            key: 'detach.tag',
            name: intl.formatMessage({ id: 'unbind.tag', defaultMessage: 'Detach Tag' }),
            auth: {
              authKey: 'detach.tag',
              resource: 'volume',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'backup',
        name: intl.formatMessage({ id: 'backup', defaultMessage: 'Backup' }),
        children: [
          {
            key: 'create.backup.volume',
            name: intl.formatMessage({ id: 'create.volumeBackup', defaultMessage: 'Create Backup' }),
            auth: {
              authKey: 'create.backup.volume',
              resource: 'volume',
              type: 'action'
            },
          },
          {
            key: 'volume.bind.backup.task',
            name: intl.formatMessage({ id: 'bind.backup.task', defaultMessage: 'Associate Backup Task' }),
            auth: {
              authKey: 'volume.bind.backup.task',
              resource: 'volume',
              type: 'action'
            },
          },
          {
            key: 'volume.bind.backup.task-divider',
            divider: true,
          },
        ],
      },
      {
        key: 'volume.create.image',
        name: intl.formatMessage({ id: 'create.volumeImage', defaultMessage: 'Create Disk Image' }),
        auth: {
          authKey: 'volume.create.image',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'volume.create.snapshot',
        name: intl.formatMessage({ id: 'create.volumeSnapshot', defaultMessage: 'Create Disk Snapshot' }),
        auth: {
          authKey: 'volume.create.snapshot',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'set.root.volume',
        name: intl.formatMessage({ id: 'set.root.volume', defaultMessage: 'Set Root Volume' }),
        auth: {
          authKey: 'set.root.volume',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'volume.set.qos',
        name: intl.formatMessage({ id: 'set.volumeQos', defaultMessage: 'Set Volume QoS' }),
        auth: {
          authKey: 'volume.set.qos',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'volume.set.qos-divider',
        divider: true,
      },
      {
        key: 'volume.flatten',
        name: intl.formatMessage({ id: 'volume.flatten', defaultMessage: 'Flatten' }),
        auth: {
          authKey: 'volume.flatten',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'move.to.recycle.bin',
        name: intl.formatMessage({ id: 'move.to.recycle.bin', defaultMessage: 'Move to Recycle Bin' }),
        auth: {
          authKey: 'move.to.recycle.bin',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'recover',
        name: intl.formatMessage({ id: 'recover', defaultMessage: 'Recover' }),
        auth: {
          authKey: 'recover',
          resource: 'volume',
          type: 'action'
        },
        icon: 'undo',
      },
      {
        key: 'expunge',
        name: intl.formatMessage({ id: 'expunge', defaultMessage: 'Expunge' }),
        auth: {
          authKey: 'expunge',
          resource: 'volume',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'attach.resource.tag',
        name: intl.formatMessage({ id: 'bind', defaultMessage: 'Associate' }),
        auth: {
          authKey: 'attach.resource.tag',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'detach.resource.tag',
        name: intl.formatMessage({ id: 'unbind', defaultMessage: 'Disassociate' }),
        auth: {
          authKey: 'detach.resource.tag',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'backup.job.attach.volume',
        name: intl.formatMessage({ id: 'bind', defaultMessage: 'Associate' }),
        auth: {
          authKey: 'backup.job.attach.volume',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'backup.job.detach.volume',
        name: intl.formatMessage({ id: 'unbind', defaultMessage: 'Disassociate' }),
        auth: {
          authKey: 'backup.job.detach.volume',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'detached.volume.attach.vm',
        name: intl.formatMessage({ id: 'attach.to.current.vm', defaultMessage: 'Attach to Current Virtual Machine' }),
        auth: {
          authKey: 'detached.volume.attach.vm',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'backup.task.enable',
        name: intl.formatMessage({ id: 'backup.task.enable', defaultMessage: 'Enable' }),
        auth: {
          authKey: 'backup.task.enable',
          resource: 'volume',
          type: 'action'
        },
      },
      {
        key: 'backup.task.disable',
        name: intl.formatMessage({ id: 'backup.task.disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'backup.task.disable',
          resource: 'volume',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.notinstantiated/header': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['edit', 'volume.attach', 'tag', 'attach.tag', 'detach.tag', 'volume.set.qos', 'delete'],
      },
      'main.notinstantiated/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'volume.attach', 'tag', 'attach.tag', 'detach.tag', 'volume.set.qos', 'delete'],
      },
      'main.notinstantiated/toolbar': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['volume.attach', 'tag', 'attach.tag', 'detach.tag', 'volume.set.qos', 'delete'],
      },
      'main.recycle/header': {
        extraKeys: ['edit', 'recover', 'expunge'],
        activeKeys: [],
      },
      'main.recycle/row': {
        extraKeys: [],
        activeKeys: ['recover', 'expunge'],
      },
      'main.recycle/toolbar': {
        extraKeys: ['recover', 'expunge'],
        activeKeys: [],
      },
      'main/header': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['edit', 'volume.attach', 'volume.detach', 'migrate', 'volume.migrate', 'volume.storage.migrate', 'change.owner', 'resize.data.volume', 'tag', 'attach.tag', 'detach.tag', 'backup', 'create.backup.volume', 'volume.bind.backup.task', 'volume.create.image', 'volume.create.snapshot', 'volume.set.qos', 'volume.flatten', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'volume.attach', 'volume.detach', 'migrate', 'volume.migrate', 'volume.storage.migrate', 'change.owner', 'resize.data.volume', 'tag', 'attach.tag', 'detach.tag', 'backup', 'create.backup.volume', 'volume.bind.backup.task', 'volume.create.image', 'volume.create.snapshot', 'volume.set.qos', 'volume.flatten', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.volume', 'enable', 'disable'],
        activeKeys: ['volume.attach', 'change.owner', 'tag', 'attach.tag', 'backup', 'volume.bind.backup.task', 'volume.set.qos', 'delete'],
      },
      'recycle/header': {
        extraKeys: ['recover', 'expunge'],
        activeKeys: ['edit'],
      },
      'recycle/row': {
        extraKeys: [],
        activeKeys: ['recover', 'expunge'],
      },
      'recycle/toolbar': {
        extraKeys: ['recover', 'expunge'],
        activeKeys: [],
      },
      'sub.account/row': {
        extraKeys: [],
        activeKeys: ['create.volume', 'enable', 'disable', 'volume.attach', 'volume.detach', 'volume.migrate', 'volume.storage.migrate', 'change.owner', 'resize.data.volume'],
      },
      'sub.account/toolbar': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['volume.attach', 'change.owner', 'delete'],
      },
      'sub.backup.job/row': {
        extraKeys: [],
        activeKeys: ['backup.job.detach.volume', 'backup.task.enable', 'backup.task.disable'],
      },
      'sub.backup.job/toolbar': {
        extraKeys: ['backup.job.attach.volume', 'backup.job.detach.volume', 'backup.task.enable', 'backup.task.disable'],
        activeKeys: [],
      },
      'sub.baremetal2.instance/row': {
        extraKeys: [],
        activeKeys: ['baremetal2Instance.detach.volume', 'resize.baremetal2.instance.data.volume', 'volume.create.image', 'delete'],
      },
      'sub.baremetal2.instance/toolbar': {
        extraKeys: ['baremetal2Instance.create.volume'],
        activeKeys: ['baremetal2Instance.attach.volume', 'baremetal2Instance.detach.volume', 'delete'],
      },
      'sub.primary-storage/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'volume.attach', 'volume.detach', 'volume.storage.migrate', 'resize.data.volume', 'delete'],
      },
      'sub.primary-storage/toolbar': {
        extraKeys: ['create.volume'],
        activeKeys: ['enable', 'disable', 'volume.attach', 'delete'],
      },
      'sub.project/row': {
        extraKeys: [],
        activeKeys: ['create.volume', 'enable', 'disable', 'volume.attach', 'volume.detach', 'volume.migrate', 'volume.storage.migrate', 'change.owner', 'resize.data.volume'],
      },
      'sub.project/toolbar': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['volume.attach', 'change.owner', 'delete'],
      },
      'sub.tag/row': {
        extraKeys: [],
        activeKeys: ['detach.resource.tag'],
      },
      'sub.tag/toolbar': {
        extraKeys: ['detach.resource.tag'],
        activeKeys: [],
      },
      'sub.vCenter/row': {
        extraKeys: [],
        activeKeys: ['create.volume', 'volume.attach', 'volume.detach', 'delete'],
      },
      'sub.vCenter/toolbar': {
        extraKeys: [],
        activeKeys: ['create.volume', 'volume.attach', 'delete'],
      },
      'sub.virtualization.account/row': {
        extraKeys: [],
        activeKeys: ['move.to.recycle.bin'],
      },
      'sub.virtualization.account/toolbar': {
        extraKeys: ['move.to.recycle.bin'],
        activeKeys: [],
      },
      'sub.virtualization.primary-storage/row': {
        extraKeys: [],
        activeKeys: ['move.to.recycle.bin'],
      },
      'sub.virtualization.primary-storage/toolbar': {
        extraKeys: ['move.to.recycle.bin'],
        activeKeys: [],
      },
      'sub.virtualization.zone.recyle/row': {
        extraKeys: [],
        activeKeys: ['recover', 'expunge'],
      },
      'sub.virtualization.zone.recyle/toolbar': {
        extraKeys: ['recover', 'expunge'],
        activeKeys: [],
      },
      'sub.vm-instance.detached/row': {
        extraKeys: [],
        activeKeys: ['detached.volume.attach.vm'],
      },
      'sub.vm-instance.detached/toolbar': {
        extraKeys: ['delete'],
        activeKeys: [],
      },
      'sub.vm-instance/row': {
        extraKeys: [],
        activeKeys: ['vm.detach.volume', 'resize.data.volume', 'volume.create.image', 'set.root.volume', 'volume.set.qos', 'volume.flatten', 'delete'],
      },
      'sub.vm-instance/toolbar': {
        extraKeys: ['vm.create.volume'],
        activeKeys: ['vm.attach.volume', 'vm.detach.volume', 'delete'],
      },
      'sub.volume.tag/row': {
        extraKeys: [],
        activeKeys: ['detach.resource.tag'],
      },
      'sub.volume.tag/toolbar': {
        extraKeys: ['attach.resource.tag', 'detach.resource.tag'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: ['create.volume'],
        activeKeys: ['volume.attach', 'volume.detach', 'resize.data.volume', 'volume.create.image', 'volume.set.qos'],
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
      genActionFromRemote('volume', intl).then(remoteConfig => {
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
