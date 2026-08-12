import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'recover' | 'expunge' | 'virtualization.attach.scsi.lun' | 'virtualization.detach.scsi.lun' | 'attach.alarm' | 'detach.alarm' | 'volume.attach.vm' | 'volume.detach.vm' | 'vm.export.url' | 'vm.export.download' | 'vm.export.delete' | 'vm.group.add.vm' | 'vm.group.remove.vm' | 'virtualization.create.instance' | 'virtualization.powerSupply.management' | 'virtualization.start' | 'virtualization.stop' | 'virtualization.reboot' | 'virtualization.resume' | 'virtualization.pause' | 'virtualization.force.stop' | 'virtualization.shutdown' | 'virtualization.console' | 'virtualization.guest.tool' | 'virtualization.install.guest.tool' | 'virtualization.reinstall.guest.tool' | 'virtualization.batch.create.snapshot' | 'virtulization.clone.collect' | 'virtualization.clone' | 'virtualization.clone.to.template' | 'virtualization.snapshot.and.image' | 'virtualization.create.snapshot' | 'virtualization.create.image' | 'virtualization.migrate.management' | 'virtualization.migrate.change.host' | 'virtualization.change.data.storage' | 'virtualization.change.host.and.data.storage' | 'virtualization.batch.migrate.host' | 'virtualization.batch.change.data.storage' | 'virtualization.batch.change.host.and.data.storage' | 'virtualization.vm.flatten' | 'virtualization.backup' | 'virtualization.create.backup.vm' | 'virtualization.vm.bind.backup.job' | 'virtualization.template.management' | 'virtualization.transform.to.template' | 'virtualization.export.ova.template' | 'virtualization.assign.start.host' | 'virtualization.edit.name.and.description' | 'virtualization.edit.config' | 'virtualization.tag.and.attribute' | 'virtualization.tag.management' | 'virtualization.set.resource.attribute' | 'virtualization.system.config' | 'virtualization.reset.vm' | 'update.data.encryption.key' | 'virtualization.nic.sync.config' | 'set.share.type' | 'virtualization.change.group' | 'virtualization.change.owner' | 'virtualization.advanced.config' | 'virtualization.edit.vm.normal.config' | 'virtualization.edit.vm.remote.console' | 'virtualization.set.sshkey' | 'virtualization.change.vm.password' | 'virtualization.edit.vm.tools.config' | 'virtualization.edit.boot.config' | 'virtualization.edit.other.config' | 'share.resource' | 'cancel.share' | 'virtualization.move.to.trash' | 'virtualization.tag.attach.vm' | 'virtualization.tag.detach.vm' | 'virtualization.backup.job.state' | 'virtualization.backup.job.enable' | 'virtualization.backup.job.disable' | 'editBackupPriority' | 'backupPolicyAttachVm' | 'backupPolicyDetachVm' | 'virtualization.snapshotStrategy.attachVm' | 'virtualization.snapshotStrategy.detachVm' | 'virtualization.console.shortcut.paste' | 'virtualization.console.shortcut.command' | 'virtualization.console.shortcut.power' | 'virtualization.console.shortcut.settings'

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
        key: 'recover',
        name: intl.formatMessage({ id: 'recover', defaultMessage: 'Recover' }),
        auth: {
          authKey: 'recover',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'expunge',
        name: intl.formatMessage({ id: 'expunge', defaultMessage: 'Expunge' }),
        auth: {
          authKey: 'expunge',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'virtualization.attach.scsi.lun',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'virtualization.attach.scsi.lun',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'virtualization.detach.scsi.lun',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'virtualization.detach.scsi.lun',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'attach.alarm',
        name: intl.formatMessage({ id: 'add', defaultMessage: 'Add' }),
        auth: {
          authKey: 'attach.alarm',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'detach.alarm',
        name: intl.formatMessage({ id: 'remove', defaultMessage: 'Remove' }),
        auth: {
          authKey: 'detach.alarm',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'volume.attach.vm',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'volume.attach.vm',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'volume.detach.vm',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'volume.detach.vm',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'vm.export.url',
        name: intl.formatMessage({ id: 'vm.export.url', defaultMessage: 'Copy URL' }),
        auth: {
          authKey: 'vm.export.url',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'vm.export.download',
        name: intl.formatMessage({ id: 'vm.export.download', defaultMessage: 'Download' }),
        auth: {
          authKey: 'vm.export.download',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'vm.export.delete',
        name: intl.formatMessage({ id: 'vm.export.delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'vm.export.delete',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'vm.group.add.vm',
        name: intl.formatMessage({ id: 'vm.group.add.vm', defaultMessage: 'Add Virtual Machine' }),
        auth: {
          authKey: 'vm.group.add.vm',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'vm.group.remove.vm',
        name: intl.formatMessage({ id: 'vm.group.remove.vm', defaultMessage: 'Remove Virtual Machine' }),
        auth: {
          authKey: 'vm.group.remove.vm',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'virtualization.create.instance',
        name: intl.formatMessage({ id: 'virtualization.create.instance', defaultMessage: 'New Virtual Machine' }),
        auth: {
          authKey: 'virtualization.create.instance',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'virtualization.powerSupply.management',
        name: intl.formatMessage({ id: 'powerSupply.management', defaultMessage: 'Power Management' }),
        children: [
          {
            key: 'virtualization.start',
            name: intl.formatMessage({ id: 'power.start', defaultMessage: 'Power On' }),
            auth: {
              authKey: 'virtualization.start',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.stop',
            name: intl.formatMessage({ id: 'power.stop', defaultMessage: 'Shut Down' }),
            auth: {
              authKey: 'virtualization.stop',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.reboot',
            name: intl.formatMessage({ id: 'reboot', defaultMessage: 'Reboot' }),
            auth: {
              authKey: 'virtualization.reboot',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.resume',
            name: intl.formatMessage({ id: 'virtualization.resume', defaultMessage: 'Resume' }),
            auth: {
              authKey: 'virtualization.resume',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.pause',
            name: intl.formatMessage({ id: 'pause', defaultMessage: 'Pause' }),
            auth: {
              authKey: 'virtualization.pause',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.force.stop',
            name: intl.formatMessage({ id: 'power.force.stop', defaultMessage: 'Force Stop' }),
            auth: {
              authKey: 'virtualization.force.stop',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.shutdown',
            name: intl.formatMessage({ id: 'shutdown', defaultMessage: 'Power Off' }),
            auth: {
              authKey: 'virtualization.shutdown',
              resource: 'vm',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'virtualization.console',
        name: intl.formatMessage({ id: 'openConsole', defaultMessage: 'Launch Console' }),
        auth: {
          authKey: 'virtualization.console',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'virtualization.guest.tool',
        name: intl.formatMessage({ id: 'virtualization.guest.tool', defaultMessage: 'VMTools' }),
        children: [
          {
            key: 'virtualization.install.guest.tool',
            name: intl.formatMessage({ id: 'virtualization.install.guest.tool', defaultMessage: 'Install VMTools' }),
            auth: {
              authKey: 'virtualization.install.guest.tool',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.reinstall.guest.tool',
            name: intl.formatMessage({ id: 'reinstall.guest.tool', defaultMessage: 'Reinstall VMTools' }),
            auth: {
              authKey: 'virtualization.reinstall.guest.tool',
              resource: 'vm',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'virtualization.guest.tool-divider',
        divider: true,
      },
      {
        key: 'virtualization.batch.create.snapshot',
        name: intl.formatMessage({ id: 'batch.create.snapshot', defaultMessage: 'Create Snapshot' }),
        auth: {
          authKey: 'virtualization.batch.create.snapshot',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'virtulization.clone.collect',
        name: intl.formatMessage({ id: 'clone', defaultMessage: 'Clone' }),
        children: [
          {
            key: 'virtualization.clone',
            name: intl.formatMessage({ id: 'virtualization.clone.to.vm', defaultMessage: 'Clone Virtual Machine' }),
            auth: {
              authKey: 'virtualization.clone',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.clone.to.template',
            name: intl.formatMessage({ id: 'virtualization.clone.to.template', defaultMessage: 'Clone to Template' }),
            auth: {
              authKey: 'virtualization.clone.to.template',
              resource: 'vm',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'virtualization.snapshot.and.image',
        name: intl.formatMessage({ id: 'snapshot.and.image', defaultMessage: 'Snapshot and Image' }),
        children: [
          {
            key: 'virtualization.create.snapshot',
            name: intl.formatMessage({ id: 'create.snapshot', defaultMessage: 'Create Snapshot' }),
            auth: {
              authKey: 'virtualization.create.snapshot',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.create.image',
            name: intl.formatMessage({ id: 'create.image', defaultMessage: 'Create Image' }),
            auth: {
              authKey: 'virtualization.create.image',
              resource: 'vm',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'virtualization.migrate.management',
        name: intl.formatMessage({ id: 'migrete.management', defaultMessage: 'Migration Management' }),
        children: [
          {
            key: 'virtualization.migrate.change.host',
            name: intl.formatMessage({ id: 'virtualization.migrate.change.host', defaultMessage: 'Change Host' }),
            auth: {
              authKey: 'virtualization.migrate.change.host',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.change.data.storage',
            name: intl.formatMessage({ id: 'virtualization.change.data.storage', defaultMessage: 'Change Data Storage' }),
            auth: {
              authKey: 'virtualization.change.data.storage',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.change.host.and.data.storage',
            name: intl.formatMessage({ id: 'virtualization.change.host.and.data.storage', defaultMessage: 'Change Host and Data Storage' }),
            auth: {
              authKey: 'virtualization.change.host.and.data.storage',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.batch.migrate.host',
            name: intl.formatMessage({ id: 'virtualization.batch.migrate.host', defaultMessage: 'Change Host' }),
            auth: {
              authKey: 'virtualization.batch.migrate.host',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.batch.change.data.storage',
            name: intl.formatMessage({ id: 'virtualization.batch.change.data.storage', defaultMessage: 'Change Data Storage' }),
            auth: {
              authKey: 'virtualization.batch.change.data.storage',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.batch.change.host.and.data.storage',
            name: intl.formatMessage({ id: 'virtualization.batch.change.host.and.data.storage', defaultMessage: 'Change Host and Data Storage' }),
            auth: {
              authKey: 'virtualization.batch.change.host.and.data.storage',
              resource: 'vm',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'virtualization.vm.flatten',
        name: intl.formatMessage({ id: 'virtualization.vm.flatten', defaultMessage: 'Flatten' }),
        auth: {
          authKey: 'virtualization.vm.flatten',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'virtualization.backup',
        name: intl.formatMessage({ id: 'backup', defaultMessage: 'Backup' }),
        children: [
          {
            key: 'virtualization.create.backup.vm',
            name: intl.formatMessage({ id: 'create.vmBackup', defaultMessage: 'Create Backup' }),
            auth: {
              authKey: 'virtualization.create.backup.vm',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.vm.bind.backup.job',
            name: intl.formatMessage({ id: 'bind.backup.task', defaultMessage: 'Associate Backup Task' }),
            auth: {
              authKey: 'virtualization.vm.bind.backup.job',
              resource: 'vm',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'virtualization.template.management',
        name: intl.formatMessage({ id: 'virtualization.template.management', defaultMessage: 'Template' }),
        children: [
          {
            key: 'virtualization.transform.to.template',
            name: intl.formatMessage({ id: 'virtualization.transform.to.template', defaultMessage: 'Convert to Template' }),
            auth: {
              authKey: 'virtualization.transform.to.template',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.export.ova.template',
            name: intl.formatMessage({ id: 'export.ova.template', defaultMessage: 'Export OVA Template' }),
            auth: {
              authKey: 'virtualization.export.ova.template',
              resource: 'vm',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'virtualization.template.management-divider',
        divider: true,
      },
      {
        key: 'virtualization.assign.start.host',
        name: intl.formatMessage({ id: 'virtualization.assign.start.host', defaultMessage: 'Specify Host to Start' }),
        auth: {
          authKey: 'virtualization.assign.start.host',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'virtualization.edit.name.and.description',
        name: intl.formatMessage({ id: 'edit.name.and.description', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'virtualization.edit.name.and.description',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'virtualization.edit.config',
        name: intl.formatMessage({ id: 'virtualization.edit.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'virtualization.edit.config',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'virtualization.tag.and.attribute',
        name: intl.formatMessage({ id: 'virtualization.tag.and.attribute', defaultMessage: 'Tag and Attribute' }),
        children: [
          {
            key: 'virtualization.tag.management',
            name: intl.formatMessage({ id: 'tag.management', defaultMessage: 'Tag Management' }),
            auth: {
              authKey: 'virtualization.tag.management',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.set.resource.attribute',
            name: intl.formatMessage({ id: 'set.resource.attribute', defaultMessage: 'Set Custom Attribute' }),
            auth: {
              authKey: 'virtualization.set.resource.attribute',
              resource: 'vm',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'virtualization.system.config',
        name: intl.formatMessage({ id: 'virtualization.system.config', defaultMessage: 'System Configuration' }),
        children: [
          {
            key: 'virtualization.reset.vm',
            name: intl.formatMessage({ id: 'virtualization.reset.vm', defaultMessage: 'Reset System' }),
            auth: {
              authKey: 'virtualization.reset.vm',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'update.data.encryption.key',
            name: intl.formatMessage({ id: 'update.data.encryption.key', defaultMessage: 'Rekey' }),
            auth: {
              authKey: 'update.data.encryption.key',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.nic.sync.config',
            name: intl.formatMessage({ id: 'virtualization.nic.sync.config', defaultMessage: 'Assign Network Configuration' }),
            auth: {
              authKey: 'virtualization.nic.sync.config',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'set.share.type',
            name: intl.formatMessage({ id: 'set.share.type', defaultMessage: 'Set Sharing Mode' }),
            auth: {
              authKey: 'set.share.type',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.change.group',
            name: intl.formatMessage({ id: 'change.group', defaultMessage: 'Change Group' }),
            auth: {
              authKey: 'virtualization.change.group',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.change.owner',
            name: intl.formatMessage({ id: 'change.owner', defaultMessage: 'Change Owner' }),
            auth: {
              authKey: 'virtualization.change.owner',
              resource: 'vm',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'virtualization.advanced.config',
        name: intl.formatMessage({ id: 'virtualization.advanced.config', defaultMessage: 'Advanced Settings' }),
        children: [
          {
            key: 'virtualization.edit.vm.normal.config',
            name: intl.formatMessage({ id: 'virtualization.edit.normal.config', defaultMessage: 'Modify General Options' }),
            auth: {
              authKey: 'virtualization.edit.vm.normal.config',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.edit.vm.remote.console',
            name: intl.formatMessage({ id: 'virtualization.edit.vm.remote.console', defaultMessage: 'Modify Remote Access' }),
            auth: {
              authKey: 'virtualization.edit.vm.remote.console',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.set.sshkey',
            name: intl.formatMessage({ id: 'virtualization.set.sshkey', defaultMessage: 'Set SSH KEY' }),
            auth: {
              authKey: 'virtualization.set.sshkey',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.change.vm.password',
            name: intl.formatMessage({ id: 'virtualization.set.vm.password', defaultMessage: 'Change VM Password' }),
            auth: {
              authKey: 'virtualization.change.vm.password',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.edit.vm.tools.config',
            name: intl.formatMessage({ id: 'virtualization.edit.vm.tools', defaultMessage: 'Modify VMTools' }),
            auth: {
              authKey: 'virtualization.edit.vm.tools.config',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.edit.boot.config',
            name: intl.formatMessage({ id: 'virtualization.edit.boot.config', defaultMessage: 'Modify Boot Options' }),
            auth: {
              authKey: 'virtualization.edit.boot.config',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.edit.other.config',
            name: intl.formatMessage({ id: 'virtualization.edit.other.config', defaultMessage: 'Modify Other Options' }),
            auth: {
              authKey: 'virtualization.edit.other.config',
              resource: 'vm',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'virtualization.advanced.config-divider',
        divider: true,
      },
      {
        key: 'share.resource',
        name: intl.formatMessage({ id: 'share.resource', defaultMessage: 'Share Resource' }),
        auth: {
          authKey: 'share.resource',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'cancel.share',
        name: intl.formatMessage({ id: 'cancel.share', defaultMessage: 'Unshare' }),
        auth: {
          authKey: 'cancel.share',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'virtualization.move.to.trash',
        name: intl.formatMessage({ id: 'move.to.trash', defaultMessage: 'Move to Recycle Bin' }),
        auth: {
          authKey: 'virtualization.move.to.trash',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'virtualization.tag.attach.vm',
        name: intl.formatMessage({ id: 'virtualization.associate', defaultMessage: 'Associate' }),
        auth: {
          authKey: 'virtualization.tag.attach.vm',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'virtualization.tag.detach.vm',
        name: intl.formatMessage({ id: 'virtualization.disassociate', defaultMessage: 'Disassociate' }),
        auth: {
          authKey: 'virtualization.tag.detach.vm',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'virtualization.backup.job.state',
        name: intl.formatMessage({ id: 'backup.job.state.management', defaultMessage: 'Backup Job State' }),
        children: [
          {
            key: 'virtualization.backup.job.enable',
            name: intl.formatMessage({ id: 'virtualization.enable.zsv', defaultMessage: 'Enable' }),
            auth: {
              authKey: 'virtualization.backup.job.enable',
              resource: 'vm',
              type: 'action'
            },
          },
          {
            key: 'virtualization.backup.job.disable',
            name: intl.formatMessage({ id: 'virtualization.disable.zsv', defaultMessage: 'Disable' }),
            auth: {
              authKey: 'virtualization.backup.job.disable',
              resource: 'vm',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'editBackupPriority',
        name: intl.formatMessage({ id: 'edit.backup.priority', defaultMessage: 'Modify Priority' }),
        auth: {
          authKey: 'editBackupPriority',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'editBackupPriority-divider',
        divider: true,
      },
      {
        key: 'backupPolicyAttachVm',
        name: intl.formatMessage({ id: 'virtualization.bind.vm', defaultMessage: 'Associate Virtual Machine' }),
        auth: {
          authKey: 'backupPolicyAttachVm',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'backupPolicyDetachVm',
        name: intl.formatMessage({ id: 'virtualization.unbind.vm', defaultMessage: 'Disassociate Virtual Machine' }),
        auth: {
          authKey: 'backupPolicyDetachVm',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'virtualization.snapshotStrategy.attachVm',
        name: intl.formatMessage({ id: 'add.vm', defaultMessage: 'Add Virtual Machine' }),
        auth: {
          authKey: 'virtualization.snapshotStrategy.attachVm',
          resource: 'snapshot.strategy',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'virtualization.snapshotStrategy.detachVm',
        name: intl.formatMessage({ id: 'remove.vm', defaultMessage: 'Remove Virtual Machine' }),
        auth: {
          authKey: 'virtualization.snapshotStrategy.detachVm',
          resource: 'snapshot.strategy',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'virtualization.console.shortcut.paste',
        name: intl.formatMessage({ id: 'virtualization.console.shortcut.paste', defaultMessage: 'Console/Local Tool Paste Command' }),
        auth: {
          authKey: 'virtualization.console.shortcut.paste',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'virtualization.console.shortcut.command',
        name: intl.formatMessage({ id: 'virtualization.console.shortcut.command', defaultMessage: 'Console/Command Tool' }),
        auth: {
          authKey: 'virtualization.console.shortcut.command',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'virtualization.console.shortcut.power',
        name: intl.formatMessage({ id: 'virtualization.console.shortcut.power', defaultMessage: 'Console/Power Tool' }),
        auth: {
          authKey: 'virtualization.console.shortcut.power',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'virtualization.console.shortcut.settings',
        name: intl.formatMessage({ id: 'virtualization.console.shortcut.settings', defaultMessage: 'Console/Read-only Mode' }),
        auth: {
          authKey: 'virtualization.console.shortcut.settings',
          resource: 'vm',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'sub.alarm/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.alarm/toolbar': {
        extraKeys: ['attach.alarm', 'detach.alarm'],
        activeKeys: [],
      },
      'sub.kms/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.kms/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.account/row': {
        extraKeys: [],
        activeKeys: ['virtualization.powerSupply.management', 'virtualization.start', 'virtualization.stop', 'virtualization.reboot', 'virtualization.resume', 'virtualization.pause', 'virtualization.force.stop', 'virtualization.shutdown', 'virtualization.console', 'virtualization.guest.tool', 'virtualization.install.guest.tool', 'virtualization.reinstall.guest.tool', 'virtulization.clone.collect', 'virtualization.clone', 'virtualization.clone.to.template', 'virtualization.snapshot.and.image', 'virtualization.create.snapshot', 'virtualization.create.image', 'virtualization.migrate.management', 'virtualization.migrate.change.host', 'virtualization.change.data.storage', 'virtualization.change.host.and.data.storage', 'virtualization.template.management', 'virtualization.transform.to.template', 'virtualization.export.ova.template', 'virtualization.edit.name.and.description', 'virtualization.edit.config', 'virtualization.tag.and.attribute', 'virtualization.tag.management', 'virtualization.set.resource.attribute', 'virtualization.system.config', 'virtualization.reset.vm', 'virtualization.nic.sync.config', 'set.share.type', 'virtualization.change.group', 'virtualization.change.owner', 'virtualization.advanced.config', 'virtualization.edit.vm.normal.config', 'virtualization.edit.vm.remote.console', 'virtualization.set.sshkey', 'virtualization.change.vm.password', 'virtualization.edit.vm.tools.config', 'virtualization.edit.boot.config', 'virtualization.edit.other.config', 'virtualization.move.to.trash'],
      },
      'sub.virtualization.account/toolbar': {
        extraKeys: ['virtualization.start', 'virtualization.stop'],
        activeKeys: ['virtualization.powerSupply.management', 'virtualization.reboot', 'virtualization.resume', 'virtualization.pause', 'virtualization.force.stop', 'virtualization.shutdown', 'virtualization.migrate.management', 'virtualization.tag.and.attribute', 'virtualization.tag.management', 'virtualization.set.resource.attribute', 'virtualization.system.config', 'virtualization.reset.vm', 'virtualization.nic.sync.config', 'set.share.type', 'virtualization.change.group', 'virtualization.change.owner', 'virtualization.move.to.trash'],
      },
      'sub.virtualization.alarm/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.backup-storage.detail.exported/row': {
        extraKeys: [],
        activeKeys: ['vm.export.url', 'vm.export.download', 'vm.export.delete'],
      },
      'sub.virtualization.backup-storage.detail.exported/toolbar': {
        extraKeys: ['vm.export.delete'],
        activeKeys: [],
      },
      'sub.virtualization.backup.policy/row': {
        extraKeys: [],
        activeKeys: ['virtualization.powerSupply.management', 'virtualization.start', 'virtualization.stop', 'virtualization.force.stop', 'virtualization.shutdown', 'virtualization.create.backup.vm', 'virtualization.backup.job.state', 'virtualization.backup.job.enable', 'virtualization.backup.job.disable', 'editBackupPriority', 'backupPolicyDetachVm'],
      },
      'sub.virtualization.backup.policy/toolbar': {
        extraKeys: ['backupPolicyAttachVm', 'backupPolicyDetachVm'],
        activeKeys: ['virtualization.powerSupply.management', 'virtualization.start', 'virtualization.stop', 'virtualization.force.stop', 'virtualization.shutdown', 'virtualization.backup.job.state', 'virtualization.backup.job.enable', 'virtualization.backup.job.disable', 'editBackupPriority'],
      },
      'sub.virtualization.directory/row': {
        extraKeys: [],
        activeKeys: ['virtualization.powerSupply.management', 'virtualization.start', 'virtualization.stop'],
      },
      'sub.virtualization.directory/toolbar': {
        extraKeys: ['virtualization.create.instance', 'virtualization.start', 'virtualization.stop'],
        activeKeys: ['virtualization.powerSupply.management'],
      },
      'sub.virtualization.fiber-channel-lun/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.fiber-channel-lun/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.host/row': {
        extraKeys: [],
        activeKeys: ['virtualization.powerSupply.management', 'virtualization.start', 'virtualization.stop', 'virtualization.reboot', 'virtualization.resume', 'virtualization.pause', 'virtualization.force.stop', 'virtualization.shutdown', 'virtualization.console', 'virtualization.guest.tool', 'virtualization.install.guest.tool', 'virtualization.reinstall.guest.tool', 'virtulization.clone.collect', 'virtualization.clone', 'virtualization.clone.to.template', 'virtualization.snapshot.and.image', 'virtualization.create.snapshot', 'virtualization.create.image', 'virtualization.migrate.management', 'virtualization.migrate.change.host', 'virtualization.change.data.storage', 'virtualization.change.host.and.data.storage', 'virtualization.backup', 'virtualization.create.backup.vm', 'virtualization.vm.bind.backup.job', 'virtualization.transform.to.template', 'virtualization.export.ova.template', 'virtualization.assign.start.host', 'virtualization.edit.name.and.description', 'virtualization.edit.config', 'virtualization.tag.and.attribute', 'virtualization.tag.management', 'virtualization.set.resource.attribute', 'virtualization.system.config', 'virtualization.reset.vm', 'update.data.encryption.key', 'virtualization.nic.sync.config', 'set.share.type', 'virtualization.change.group', 'virtualization.change.owner', 'virtualization.advanced.config', 'virtualization.edit.vm.normal.config', 'virtualization.edit.vm.remote.console', 'virtualization.set.sshkey', 'virtualization.change.vm.password', 'virtualization.edit.vm.tools.config', 'virtualization.edit.boot.config', 'virtualization.edit.other.config', 'virtualization.move.to.trash'],
      },
      'sub.virtualization.host/toolbar': {
        extraKeys: ['virtualization.create.instance', 'virtualization.start', 'virtualization.stop'],
        activeKeys: ['virtualization.powerSupply.management', 'virtualization.reboot', 'virtualization.resume', 'virtualization.pause', 'virtualization.force.stop', 'virtualization.shutdown', 'virtualization.batch.create.snapshot', 'virtualization.migrate.management', 'virtualization.batch.migrate.host', 'virtualization.batch.change.data.storage', 'virtualization.batch.change.host.and.data.storage', 'virtualization.vm.bind.backup.job', 'virtualization.tag.and.attribute', 'virtualization.tag.management', 'virtualization.set.resource.attribute', 'virtualization.system.config', 'update.data.encryption.key', 'set.share.type', 'virtualization.change.group', 'virtualization.change.owner', 'virtualization.move.to.trash'],
      },
      'sub.virtualization.image/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.image/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.iscsi.lun/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.iscsi.lun/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.primary.storage/row': {
        extraKeys: [],
        activeKeys: ['virtualization.powerSupply.management', 'virtualization.start', 'virtualization.stop', 'virtualization.reboot', 'virtualization.resume', 'virtualization.pause', 'virtualization.force.stop', 'virtualization.shutdown', 'virtualization.guest.tool', 'virtualization.install.guest.tool', 'virtualization.reinstall.guest.tool', 'virtulization.clone.collect', 'virtualization.clone', 'virtualization.clone.to.template', 'virtualization.snapshot.and.image', 'virtualization.create.snapshot', 'virtualization.create.image', 'virtualization.migrate.management', 'virtualization.migrate.change.host', 'virtualization.change.data.storage', 'virtualization.change.host.and.data.storage', 'virtualization.transform.to.template', 'virtualization.export.ova.template', 'virtualization.edit.name.and.description', 'virtualization.edit.config', 'virtualization.tag.and.attribute', 'virtualization.tag.management', 'virtualization.set.resource.attribute', 'virtualization.system.config', 'virtualization.reset.vm', 'update.data.encryption.key', 'virtualization.nic.sync.config', 'set.share.type', 'virtualization.change.group', 'virtualization.change.owner', 'virtualization.advanced.config', 'virtualization.edit.vm.normal.config', 'virtualization.edit.vm.remote.console', 'virtualization.set.sshkey', 'virtualization.change.vm.password', 'virtualization.edit.vm.tools.config', 'virtualization.edit.boot.config', 'virtualization.edit.other.config', 'virtualization.move.to.trash'],
      },
      'sub.virtualization.primary.storage/toolbar': {
        extraKeys: ['virtualization.create.instance', 'virtualization.start', 'virtualization.stop'],
        activeKeys: ['virtualization.powerSupply.management', 'virtualization.reboot', 'virtualization.resume', 'virtualization.pause', 'virtualization.force.stop', 'virtualization.shutdown', 'virtualization.batch.create.snapshot', 'virtualization.migrate.management', 'virtualization.batch.migrate.host', 'virtualization.batch.change.data.storage', 'virtualization.batch.change.host.and.data.storage', 'virtualization.tag.and.attribute', 'virtualization.tag.management', 'virtualization.set.resource.attribute', 'virtualization.move.to.trash'],
      },
      'sub.virtualization.protectedResource/directory': {
        extraKeys: [],
        activeKeys: ['virtualization.powerSupply.management', 'virtualization.start', 'virtualization.stop', 'virtualization.create.backup.vm', 'virtualization.vm.bind.backup.job'],
      },
      'sub.virtualization.protectedResource/header': {
        extraKeys: ['virtualization.start', 'virtualization.stop', 'virtualization.vm.bind.backup.job'],
        activeKeys: [],
      },
      'sub.virtualization.snapshot-strategy/row': {
        extraKeys: [],
        activeKeys: ['virtualization.snapshotStrategy.detachVm'],
      },
      'sub.virtualization.snapshot-strategy/toolbar': {
        extraKeys: ['virtualization.snapshotStrategy.attachVm'],
        activeKeys: ['virtualization.snapshotStrategy.detachVm'],
      },
      'sub.virtualization.snapshot.dir/directory': {
        extraKeys: [],
        activeKeys: ['virtualization.powerSupply.management', 'virtualization.start', 'virtualization.stop', 'virtualization.create.snapshot'],
      },
      'sub.virtualization.tag/row': {
        extraKeys: [],
        activeKeys: ['virtualization.tag.detach.vm'],
      },
      'sub.virtualization.tag/toolbar': {
        extraKeys: ['virtualization.tag.attach.vm', 'virtualization.tag.detach.vm'],
        activeKeys: [],
      },
      'sub.virtualization.user/row': {
        extraKeys: [],
        activeKeys: ['virtualization.powerSupply.management', 'virtualization.start', 'virtualization.stop', 'virtualization.reboot', 'virtualization.resume', 'virtualization.pause', 'virtualization.force.stop', 'virtualization.shutdown', 'virtualization.console', 'virtualization.guest.tool', 'virtualization.install.guest.tool', 'virtualization.reinstall.guest.tool', 'virtualization.batch.create.snapshot', 'virtulization.clone.collect', 'virtualization.clone', 'virtualization.clone.to.template', 'virtualization.snapshot.and.image', 'virtualization.create.snapshot', 'virtualization.create.image', 'virtualization.migrate.management', 'virtualization.migrate.change.host', 'virtualization.change.data.storage', 'virtualization.change.host.and.data.storage', 'virtualization.template.management', 'virtualization.transform.to.template', 'virtualization.export.ova.template', 'virtualization.edit.name.and.description', 'virtualization.edit.config', 'virtualization.tag.and.attribute', 'virtualization.tag.management', 'virtualization.set.resource.attribute', 'virtualization.system.config', 'virtualization.reset.vm', 'virtualization.nic.sync.config', 'set.share.type', 'virtualization.change.group', 'virtualization.change.owner', 'virtualization.advanced.config', 'virtualization.edit.vm.normal.config', 'virtualization.edit.vm.remote.console', 'virtualization.set.sshkey', 'virtualization.change.vm.password', 'virtualization.edit.vm.tools.config', 'virtualization.edit.boot.config', 'virtualization.edit.other.config', 'cancel.share', 'virtualization.move.to.trash'],
      },
      'sub.virtualization.user/toolbar': {
        extraKeys: ['share.resource', 'cancel.share'],
        activeKeys: [],
      },
      'sub.virtualization.userGroup.shared/row': {
        extraKeys: [],
        activeKeys: ['virtualization.powerSupply.management', 'virtualization.start', 'virtualization.stop', 'virtualization.reboot', 'virtualization.resume', 'virtualization.pause', 'virtualization.force.stop', 'virtualization.shutdown', 'virtualization.console', 'virtualization.guest.tool', 'virtualization.install.guest.tool', 'virtualization.reinstall.guest.tool', 'virtualization.batch.create.snapshot', 'virtulization.clone.collect', 'virtualization.clone', 'virtualization.clone.to.template', 'virtualization.snapshot.and.image', 'virtualization.create.snapshot', 'virtualization.create.image', 'virtualization.migrate.management', 'virtualization.migrate.change.host', 'virtualization.change.data.storage', 'virtualization.change.host.and.data.storage', 'virtualization.template.management', 'virtualization.transform.to.template', 'virtualization.export.ova.template', 'virtualization.edit.name.and.description', 'virtualization.edit.config', 'virtualization.tag.and.attribute', 'virtualization.tag.management', 'virtualization.set.resource.attribute', 'virtualization.system.config', 'virtualization.reset.vm', 'virtualization.nic.sync.config', 'set.share.type', 'virtualization.change.group', 'virtualization.change.owner', 'virtualization.advanced.config', 'virtualization.edit.vm.normal.config', 'virtualization.edit.vm.remote.console', 'virtualization.set.sshkey', 'virtualization.change.vm.password', 'virtualization.edit.vm.tools.config', 'virtualization.edit.boot.config', 'virtualization.edit.other.config', 'cancel.share', 'virtualization.move.to.trash'],
      },
      'sub.virtualization.userGroup.shared/toolbar': {
        extraKeys: ['share.resource', 'cancel.share'],
        activeKeys: [],
      },
      'sub.virtualization.vm-group/row': {
        extraKeys: [],
        activeKeys: ['vm.group.remove.vm'],
      },
      'sub.virtualization.vm-group/toolbar': {
        extraKeys: ['vm.group.add.vm', 'vm.group.remove.vm'],
        activeKeys: [],
      },
      'sub.virtualization.vm-scheduling-rule/row': {
        extraKeys: [],
        activeKeys: ['vm.group.remove.vm', 'virtualization.start', 'virtualization.stop', 'virtualization.force.stop', 'virtualization.shutdown'],
      },
      'sub.virtualization.vm-scheduling-rule/toolbar': {
        extraKeys: ['vm.group.add.vm', 'vm.group.remove.vm'],
        activeKeys: [],
      },
      'sub.virtualization.vm.export/header': {
        extraKeys: ['vm.export.delete'],
        activeKeys: [],
      },
      'sub.virtualization.vm.export/row': {
        extraKeys: [],
        activeKeys: ['vm.export.url', 'vm.export.download', 'vm.export.delete'],
      },
      'sub.virtualization.vm.export/toolbar': {
        extraKeys: ['vm.export.delete'],
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
      'sub.virtualization.zone/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.zone/row': {
        extraKeys: [],
        activeKeys: ['virtualization.powerSupply.management', 'virtualization.start', 'virtualization.stop', 'virtualization.reboot', 'virtualization.resume', 'virtualization.pause', 'virtualization.force.stop', 'virtualization.shutdown', 'virtualization.console', 'virtualization.guest.tool', 'virtualization.install.guest.tool', 'virtualization.reinstall.guest.tool', 'virtulization.clone.collect', 'virtualization.clone', 'virtualization.clone.to.template', 'virtualization.snapshot.and.image', 'virtualization.create.snapshot', 'virtualization.create.image', 'virtualization.migrate.management', 'virtualization.migrate.change.host', 'virtualization.change.data.storage', 'virtualization.change.host.and.data.storage', 'virtualization.backup', 'virtualization.create.backup.vm', 'virtualization.vm.bind.backup.job', 'virtualization.transform.to.template', 'virtualization.export.ova.template', 'virtualization.assign.start.host', 'virtualization.edit.name.and.description', 'virtualization.edit.config', 'virtualization.tag.and.attribute', 'virtualization.tag.management', 'virtualization.set.resource.attribute', 'virtualization.system.config', 'virtualization.reset.vm', 'update.data.encryption.key', 'virtualization.nic.sync.config', 'set.share.type', 'virtualization.change.group', 'virtualization.change.owner', 'virtualization.advanced.config', 'virtualization.edit.vm.normal.config', 'virtualization.edit.vm.remote.console', 'virtualization.set.sshkey', 'virtualization.change.vm.password', 'virtualization.edit.vm.tools.config', 'virtualization.edit.boot.config', 'virtualization.edit.other.config', 'virtualization.move.to.trash'],
      },
      'sub.virtualization.zone/toolbar': {
        extraKeys: ['virtualization.create.instance', 'virtualization.start', 'virtualization.stop'],
        activeKeys: ['virtualization.reboot', 'virtualization.resume', 'virtualization.pause', 'virtualization.force.stop', 'virtualization.shutdown', 'virtualization.batch.create.snapshot', 'virtualization.migrate.management', 'virtualization.batch.migrate.host', 'virtualization.batch.change.data.storage', 'virtualization.batch.change.host.and.data.storage', 'virtualization.vm.bind.backup.job', 'virtualization.tag.and.attribute', 'virtualization.tag.management', 'virtualization.set.resource.attribute', 'virtualization.reset.vm', 'update.data.encryption.key', 'set.share.type', 'virtualization.change.group', 'virtualization.change.owner', 'virtualization.move.to.trash'],
      },
      'sub.virtualization/row': {
        extraKeys: [],
        activeKeys: ['virtualization.powerSupply.management', 'virtualization.start', 'virtualization.stop', 'virtualization.reboot', 'virtualization.resume', 'virtualization.pause', 'virtualization.force.stop', 'virtualization.shutdown', 'virtualization.console', 'virtualization.guest.tool', 'virtualization.install.guest.tool', 'virtualization.reinstall.guest.tool', 'virtulization.clone.collect', 'virtualization.clone', 'virtualization.clone.to.template', 'virtualization.snapshot.and.image', 'virtualization.create.snapshot', 'virtualization.create.image', 'virtualization.migrate.management', 'virtualization.migrate.change.host', 'virtualization.change.data.storage', 'virtualization.change.host.and.data.storage', 'virtualization.backup', 'virtualization.create.backup.vm', 'virtualization.vm.bind.backup.job', 'virtualization.transform.to.template', 'virtualization.export.ova.template', 'virtualization.assign.start.host', 'virtualization.edit.name.and.description', 'virtualization.edit.config', 'virtualization.tag.and.attribute', 'virtualization.tag.management', 'virtualization.set.resource.attribute', 'virtualization.system.config', 'virtualization.reset.vm', 'update.data.encryption.key', 'virtualization.nic.sync.config', 'set.share.type', 'virtualization.change.group', 'virtualization.change.owner', 'virtualization.advanced.config', 'virtualization.edit.vm.normal.config', 'virtualization.edit.vm.remote.console', 'virtualization.set.sshkey', 'virtualization.change.vm.password', 'virtualization.edit.vm.tools.config', 'virtualization.edit.boot.config', 'virtualization.edit.other.config', 'virtualization.move.to.trash'],
      },
      'sub.virtualization/toolbar': {
        extraKeys: ['virtualization.create.instance', 'virtualization.start', 'virtualization.stop'],
        activeKeys: ['virtualization.powerSupply.management', 'virtualization.reboot', 'virtualization.resume', 'virtualization.pause', 'virtualization.force.stop', 'virtualization.shutdown', 'virtualization.batch.create.snapshot', 'virtualization.migrate.management', 'virtualization.batch.migrate.host', 'virtualization.batch.change.data.storage', 'virtualization.batch.change.host.and.data.storage', 'virtualization.vm.bind.backup.job', 'virtualization.tag.and.attribute', 'virtualization.tag.management', 'virtualization.set.resource.attribute', 'virtualization.system.config', 'update.data.encryption.key', 'set.share.type', 'virtualization.change.group', 'virtualization.change.owner', 'virtualization.move.to.trash'],
      },
      'sub.zsv.vm.template/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.zsv.vm.template/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'virtualization.dir/directory': {
        extraKeys: [],
        activeKeys: ['virtualization.start', 'virtualization.stop', 'virtualization.reboot', 'virtualization.resume', 'virtualization.pause', 'virtualization.force.stop', 'virtualization.shutdown', 'virtualization.console', 'virtualization.install.guest.tool', 'virtualization.reinstall.guest.tool', 'virtulization.clone.collect', 'virtualization.clone', 'virtualization.clone.to.template', 'virtualization.create.snapshot', 'virtualization.create.image', 'virtualization.migrate.change.host', 'virtualization.change.data.storage', 'virtualization.change.host.and.data.storage', 'virtualization.backup', 'virtualization.create.backup.vm', 'virtualization.vm.bind.backup.job', 'virtualization.template.management', 'virtualization.transform.to.template', 'virtualization.export.ova.template', 'virtualization.assign.start.host', 'virtualization.edit.name.and.description', 'virtualization.edit.config', 'virtualization.tag.and.attribute', 'virtualization.tag.management', 'virtualization.set.resource.attribute', 'virtualization.reset.vm', 'update.data.encryption.key', 'virtualization.nic.sync.config', 'set.share.type', 'virtualization.change.group', 'virtualization.change.owner', 'virtualization.advanced.config', 'virtualization.edit.vm.normal.config', 'virtualization.edit.vm.remote.console', 'virtualization.set.sshkey', 'virtualization.change.vm.password', 'virtualization.edit.vm.tools.config', 'virtualization.edit.boot.config', 'virtualization.edit.other.config', 'virtualization.move.to.trash'],
      },
      'virtualization.dir/header': {
        extraKeys: [],
        activeKeys: ['vm.export.delete'],
      },
      'virtualization.main/header': {
        extraKeys: ['virtualization.start', 'virtualization.stop', 'virtualization.console', 'virtualization.edit.config'],
        activeKeys: ['virtualization.reboot', 'virtualization.resume', 'virtualization.pause', 'virtualization.force.stop', 'virtualization.shutdown', 'virtualization.install.guest.tool', 'virtualization.reinstall.guest.tool', 'virtulization.clone.collect', 'virtualization.clone', 'virtualization.clone.to.template', 'virtualization.create.snapshot', 'virtualization.create.image', 'virtualization.migrate.change.host', 'virtualization.change.data.storage', 'virtualization.change.host.and.data.storage', 'virtualization.backup', 'virtualization.create.backup.vm', 'virtualization.vm.bind.backup.job', 'virtualization.template.management', 'virtualization.transform.to.template', 'virtualization.export.ova.template', 'virtualization.assign.start.host', 'virtualization.edit.name.and.description', 'virtualization.tag.and.attribute', 'virtualization.tag.management', 'virtualization.set.resource.attribute', 'virtualization.reset.vm', 'update.data.encryption.key', 'virtualization.nic.sync.config', 'set.share.type', 'virtualization.change.group', 'virtualization.change.owner', 'virtualization.advanced.config', 'virtualization.edit.vm.normal.config', 'virtualization.edit.vm.remote.console', 'virtualization.set.sshkey', 'virtualization.change.vm.password', 'virtualization.edit.vm.tools.config', 'virtualization.edit.boot.config', 'virtualization.edit.other.config', 'virtualization.move.to.trash'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('vm', intl).then(remoteConfig => {
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
