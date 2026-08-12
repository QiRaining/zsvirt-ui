function getActionAuth(intl: any) {
  const actionConfig: any = {
    dashboard: {},
    wizard: {},
    "root.node": {
      create: intl.formatMessage({
        id: "virtualization.create.zone",
        defaultMessage: "New Data Center",
      }),
      settings: intl.formatMessage({ id: "settings", defaultMessage: "Settings" }),
    },
    vm: {
      recover: intl.formatMessage({ id: "recover", defaultMessage: "Recover" }),
      expunge: intl.formatMessage({
        id: "expunge",
        defaultMessage: "Expunge",
      }),
      "virtualization.attach.scsi.lun": intl.formatMessage({
        id: "scsiLun.attach.vm",
        defaultMessage: "Attach VM Instance to LUN",
      }),
      "virtualization.detach.scsi.lun": intl.formatMessage({
        id: "scsiLun.detach.vm",
        defaultMessage: "Detach VM Instance from LUN",
      }),
      "attach.alarm": intl.formatMessage({
        id: "add.alarm",
        defaultMessage: "Add Alarm",
      }),
      "detach.alarm": intl.formatMessage({
        id: "remove.alarm",
        defaultMessage: "Remove Alarm",
      }),
      "volume.attach.vm": intl.formatMessage({
        id: "volume.attach.vm",
        defaultMessage: "Attach Disk to Virtual Machine",
      }),
      "volume.detach.vm": intl.formatMessage({
        id: "volume.detach.vm",
        defaultMessage: "Detach Disk from Virtual Machine",
      }),
      "vm.export.url": intl.formatMessage({
        id: "vm.export.url",
        defaultMessage: "Copy URL",
      }),
      "vm.export.download": intl.formatMessage({
        id: "vm.export.download",
        defaultMessage: "Download",
      }),
      "vm.export.delete": intl.formatMessage({
        id: "vm.export.delete",
        defaultMessage: "Delete",
      }),
      "vm.group.add.vm": intl.formatMessage({
        id: "vm.group.add.vm",
        defaultMessage: "Add Virtual Machine",
      }),
      "vm.group.remove.vm": intl.formatMessage({
        id: "vm.group.remove.vm",
        defaultMessage: "Remove Virtual Machine",
      }),
      "virtualization.create.instance": intl.formatMessage({
        id: "virtualization.create.instance",
        defaultMessage: "New Virtual Machine",
      }),
      "virtualization.start": intl.formatMessage({
        id: "power.start",
        defaultMessage: "Power On",
      }),
      "virtualization.stop": intl.formatMessage({
        id: "power.stop",
        defaultMessage: "Shut Down",
      }),
      "virtualization.reboot": intl.formatMessage({
        id: "reboot",
        defaultMessage: "",
      }),
      "virtualization.resume": intl.formatMessage({
        id: "virtualization.resume",
        defaultMessage: "",
      }),
      "virtualization.pause": intl.formatMessage({
        id: "pause",
        defaultMessage: "",
      }),
      "virtualization.force.stop": intl.formatMessage({
        id: "power.force.stop",
        defaultMessage: "",
      }),
      "virtualization.shutdown": intl.formatMessage({
        id: "shutdown",
        defaultMessage: "",
      }),
      "virtualization.console": intl.formatMessage({
        id: "openConsole",
        defaultMessage: "Launch Console",
      }),
      "virtualization.install.guest.tool": intl.formatMessage({
        id: "virtualization.install.guest.tool",
        defaultMessage: "",
      }),
      "virtualization.reinstall.guest.tool": intl.formatMessage({
        id: "reinstall.guest.tool",
        defaultMessage: "",
      }),
      "virtualization.batch.create.snapshot": intl.formatMessage({
        id: "batch.create.snapshot",
        defaultMessage: "Create Snapshot",
      }),
      "virtualization.clone": intl.formatMessage({
        id: "virtualization.clone.to.vm",
        defaultMessage: "",
      }),
      "virtualization.clone.to.template": intl.formatMessage({
        id: "virtualization.clone.to.template",
        defaultMessage: "",
      }),
      "virtualization.create.snapshot": intl.formatMessage({
        id: "create.snapshot",
        defaultMessage: "",
      }),
      "virtualization.create.image": intl.formatMessage({
        id: "create.image",
        defaultMessage: "",
      }),
      "virtualization.migrate.change.host": intl.formatMessage({
        id: "virtualization.migrate.change.host",
        defaultMessage: "",
      }),
      "virtualization.change.data.storage": intl.formatMessage({
        id: "virtualization.change.data.storage",
        defaultMessage: "",
      }),
      "virtualization.change.host.and.data.storage": intl.formatMessage({
        id: "virtualization.change.host.and.data.storage",
        defaultMessage: "",
      }),
      "virtualization.batch.migrate.host": intl.formatMessage({
        id: "virtualization.batchMigrate.host",
        defaultMessage: "Change Host in Bulk	",
      }),
      "virtualization.batch.change.data.storage": intl.formatMessage({
        id: "virtualization.batchChange.data.storage",
        defaultMessage: "Change Data Storage in Bulk",
      }),
      "virtualization.batch.change.host.and.data.storage": intl.formatMessage({
        id: "virtualization.batchChange.host.and.data.storage	",
        defaultMessage: "Batch Change Host and Data Storage",
      }),
      "virtualization.vm.flatten": intl.formatMessage({
        id: "virtualization.vm.flatten",
        defaultMessage: "Flatten",
      }),
      "virtualization.create.backup.vm": intl.formatMessage({
        id: "create.vmBackup",
        defaultMessage: "",
      }),
      "virtualization.vm.bind.backup.job": intl.formatMessage({
        id: "bind.backup.task",
        defaultMessage: "",
      }),
      "virtualization.transform.to.template": intl.formatMessage({
        id: "virtualization.transform.to.template",
        defaultMessage: "",
      }),
      "virtualization.export.ova.template": intl.formatMessage({
        id: "export.ova.template",
        defaultMessage: "",
      }),
      "virtualization.assign.start.host": intl.formatMessage({
        id: "virtualization.assign.start.host",
        defaultMessage: "Specify Host to Start",
      }),
      "virtualization.edit.name.and.description": intl.formatMessage({
        id: "edit.name.and.description",
        defaultMessage: "Edit Name and Description",
      }),
      "virtualization.edit.config": intl.formatMessage({
        id: "virtualization.edit.config",
        defaultMessage: "Modify Configuration",
      }),
      "virtualization.tag.management": intl.formatMessage({
        id: "tag.management",
        defaultMessage: "",
      }),
      "virtualization.set.resource.attribute": intl.formatMessage({
        id: "set.resource.attribute",
        defaultMessage: "",
      }),
      "virtualization.reset.vm": intl.formatMessage({
        id: "virtualization.reset.vm",
        defaultMessage: "",
      }),
      "update.data.encryption.key": intl.formatMessage({
        id: "update.data.encryption.key",
        defaultMessage: "",
      }),
      "virtualization.nic.sync.config": intl.formatMessage({
        id: "virtualization.nic.sync.config",
        defaultMessage: "",
      }),
      "set.share.type": intl.formatMessage({
        id: "set.share.type",
        defaultMessage: "Set Sharing Mode",
      }),
      "virtualization.change.group": intl.formatMessage({
        id: "change.group",
        defaultMessage: "",
      }),
      "virtualization.change.owner": intl.formatMessage({
        id: "change.owner",
        defaultMessage: "",
      }),
      "virtualization.edit.vm.normal.config": intl.formatMessage({
        id: "virtualization.edit.normal.config",
        defaultMessage: "",
      }),
      "virtualization.edit.vm.remote.console": intl.formatMessage({
        id: "virtualization.edit.vm.remote.console",
        defaultMessage: "",
      }),
      "virtualization.set.sshkey": intl.formatMessage({
        id: "virtualization.set.sshkey",
        defaultMessage: "",
      }),
      "virtualization.change.vm.password": intl.formatMessage({
        id: "virtualization.set.vm.password",
        defaultMessage: "",
      }),
      "virtualization.edit.vm.tools.config": intl.formatMessage({
        id: "virtualization.edit.vm.tools",
        defaultMessage: "",
      }),
      "virtualization.edit.boot.config": intl.formatMessage({
        id: "virtualization.edit.boot.config",
        defaultMessage: "",
      }),
      "virtualization.edit.other.config": intl.formatMessage({
        id: "virtualization.edit.other.config",
        defaultMessage: "",
      }),
      "share.resource": intl.formatMessage({
        id: "share.resource",
        defaultMessage: "Share Resource",
      }),
      "cancel.share": intl.formatMessage({
        id: "cancel.share",
        defaultMessage: "Unshare",
      }),
      "virtualization.move.to.trash": intl.formatMessage({
        id: "move.to.trash",
        defaultMessage: "Move to Recycle Bin",
      }),
      "virtualization.tag.attach.vm": intl.formatMessage({
        id: "virtualization.associate.vm",
        defaultMessage: "Attach Tag to VM",
      }),
      "virtualization.tag.detach.vm": intl.formatMessage({
        id: "virtualization.disassociate.vm",
        defaultMessage: "Detach Tag from VM",
      }),
      "virtualization.backup.job.enable": intl.formatMessage({
        id: "virtualization.enable.backup.job.for.vm",
        defaultMessage: "Enable VM Backup Job",
      }),
      "virtualization.backup.job.disable": intl.formatMessage({
        id: "virtualization.disable.backup.job.for.vm",
        defaultMessage: "Disable VM Backup Job",
      }),
      editBackupPriority: intl.formatMessage({
        id: "virtualization.edit.buckup.job.priority",
        defaultMessage: "Modify Backup Plan Priority",
      }),
      backupPolicyAttachVm: intl.formatMessage({
        id: "virtualization.bind.vm",
        defaultMessage: "Associate Virtual Machine",
      }),
      backupPolicyDetachVm: intl.formatMessage({
        id: "virtualization.unbind.vm",
        defaultMessage: "Disassociate Virtual Machine",
      }),
      "virtualization.snapshotStrategy.attachVm": intl.formatMessage({
        id: "add.vm",
        defaultMessage: "Add Virtual Machine",
      }),
      "virtualization.snapshotStrategy.detachVm": intl.formatMessage({
        id: "remove.vm",
        defaultMessage: "Remove Virtual Machine",
      }),
      "virtualization.console.shortcut.paste": intl.formatMessage({
        id: "virtualization.console.shortcut.paste",
        defaultMessage: "Console/Local Tool Paste Command",
      }),
      "virtualization.console.shortcut.command": intl.formatMessage({
        id: "virtualization.console.shortcut.command",
        defaultMessage: "Console/Command Tool",
      }),
      "virtualization.console.shortcut.power": intl.formatMessage({
        id: "virtualization.console.shortcut.power",
        defaultMessage: "Console/Power Tool",
      }),
      "virtualization.console.shortcut.settings": intl.formatMessage({
        id: "virtualization.console.shortcut.settings",
        defaultMessage: "Console/Read-only Mode",
      }),
      "attach.gpu.device": intl.formatMessage({
        id: "vm.attach.gpuDevice",
        defaultMessage: "Attach Physical GPU Device to VM Instance",
      }),
      "dettach.gpu.device": intl.formatMessage({
        id: "vm.detach.gpuDevice",
        defaultMessage: "Attach Physical GPU Device to VM Instance",
      }),
      "attach.pci.device": intl.formatMessage({
        id: "vm.attach.pcidevice",
        defaultMessage: "Attach Other Devices to VM Instance",
      }),
      "detach.pci.device": intl.formatMessage({
        id: "vm.detach.pcidevice",
        defaultMessage: "Detach Other Devices from VM Instance",
      }),
      "vm.scsi.lun.attach.vm": intl.formatMessage({
        id: "vm.attach.scsi.lun",
        defaultMessage: "Attach LUN to VM Instance",
      }),
      "vm.scsi.lun.detach.vm": intl.formatMessage({
        id: "vm.detach.scsi.lun",
        defaultMessage: "Detach LUN from VM",
      }),
      "vm.attach.usb": intl.formatMessage({
        id: "vm.attach.usb.in.sub",
        defaultMessage: "Attach",
      }),
      "vm.detach.usb": intl.formatMessage({
        id: "vm.detach.usb.in.sub",
        defaultMessage: "Detach",
      }),
      "attach.vgpu.device": intl.formatMessage({
        id: "vm.attach.vgpuDevice",
        defaultMessage: "Attach vGPUs to VM",
      }),
      "detach.vgpu.device": intl.formatMessage({
        id: "vm.detach.vgpuDevice",
        defaultMessage: "Detach vGPUs from VM",
      }),
      "enable.nic.in.vm": intl.formatMessage({
        id: "enable.nic",
        defaultMessage: "Enable NIC",
      }),
      "disable.nic.in.vm": intl.formatMessage({
        id: "disable.nic",
        defaultMessage: "Disable NIC",
      }),
      "attach.nic.in.vm": intl.formatMessage({
        id: "attach.nic",
        defaultMessage: "Attach NIC",
      }),
      "set.default.network": intl.formatMessage({
        id: "set.default.network",
        defaultMessage: "Set Default Network",
      }),
      "set.nic.type": intl.formatMessage({
        id: "set.nicType",
        defaultMessage: "Set NIC Type",
      }),
      "set.mac": intl.formatMessage({
        id: "set.mac",
        defaultMessage: "Set MAC",
      }),
      "set.ip": intl.formatMessage({
        id: "set.network.and.ip.address",
        defaultMessage: "Set Network and IP Address",
      }),
      "sync.config": intl.formatMessage({
        id: "sync.config",
        defaultMessage: "Synchronize Configurations",
      }),
      "set.nic.drive.type": intl.formatMessage({
        id: "set.nicDriveType",
        defaultMessage: "Set NIC Model",
      }),
      "set.qos": intl.formatMessage({
        id: "set.nicQos",
        defaultMessage: "Set NIC QoS",
      }),
      "vmNic.set.securityGroup": intl.formatMessage({
        id: "vmNic.set.securityGroup",
        defaultMessage: "Set Security Group",
      }),
      "detach.nic.in.vm": intl.formatMessage({
        id: "detach.nic",
        defaultMessage: "Detach NIC",
      }),
      "vm.nic.bind.eip": intl.formatMessage({
        id: "vm.nic.bind.eip",
        defaultMessage: "Attach EIP",
      }),
      "vm.nic.unbind.eip": intl.formatMessage({
        id: "vm.nic.unbind.eip",
        defaultMessage: "Detach EIP",
      }),
    },
    cluster: {
      "add.host": intl.formatMessage({
        id: "add.host",
        defaultMessage: "Add Host",
      }),
      "virtualization.create.instance": intl.formatMessage({
        id: "virtualization.create.instance.from.cluster",
        defaultMessage: "New Virtual Machine",
      }),
      "create.l3Network": intl.formatMessage({
        id: "virtualization.cluster.create.l3Network",
        defaultMessage: "New Distributed Switch",
      }),
      "add.dataStorage": intl.formatMessage({
        id: "add.dataStorage",
        defaultMessage: "Add Data Storage",
      }),
      "virtualization.create.cluster": intl.formatMessage({
        id: "virtualization.create.cluster",
        defaultMessage: "New Cluster",
      }),
      edit: intl.formatMessage({ id: "edit", defaultMessage: "Edit" }),
      "modify.config": intl.formatMessage({
        id: "modify.config",
        defaultMessage: "Modify Configuration",
      }),
      "virtualization.modify.network.setting": intl.formatMessage({
        id: "virtualization.modify.network.setting",
        defaultMessage: "Edit Cluster Network",
      }),
      "virtualization.modify.resource.config": intl.formatMessage({
        id: "virtualization.modify.resource.config",
        defaultMessage: "Edit Cluster Overcommit",
      }),
      "virtualization.modify.host.setting": intl.formatMessage({
        id: "virtualization.modify.host.setting",
        defaultMessage: "Edit Host Settings",
      }),
      "virtualization.modify.vm.setting": intl.formatMessage({
        id: "virtualization.modify.vm.setting",
        defaultMessage: "Edit VM Settings",
      }),
      enable: intl.formatMessage({ id: "enable", defaultMessage: "Enable " }),
      disable: intl.formatMessage({ id: "disable", defaultMessage: "Disable" }),
      "attach.in.virtualization.primary.storage": intl.formatMessage({
        id: "attach",
        defaultMessage: "Attach",
      }),
      "detach.in.virtualization.primary.storage": intl.formatMessage({
        id: "detach",
        defaultMessage: "Detach",
      }),
      "virtualization.attach.to.l2.network": intl.formatMessage({
        id: "virtualization.attach.cluster",
        defaultMessage: "Attach Cluster",
      }),
      "virtualization.detach.from.l2.network": intl.formatMessage({
        id: "virtualization.detach.cluster",
        defaultMessage: "Detach Cluster",
      }),
      "virtualization.iscsi.server.attach.cluster": intl.formatMessage({
        id: "attach",
        defaultMessage: "Attach",
      }),
      "virtualization.iscsi.server.detach.cluster": intl.formatMessage({
        id: "detach",
        defaultMessage: "Detach",
      }),
      "virtualization.attach.l2.network": intl.formatMessage({
        id: "virtualization.attach.l2.network",
        defaultMessage: "Loading Distributed Switch.",
      }),
      "virtualization.detach.l2.network": intl.formatMessage({
        id: "virtualization.detach.l2.network",
        defaultMessage: "Uninstall Distributed Switch.",
      }),
      "virtualization.attach.primaryStorage": intl.formatMessage({
        id: "virtualization.attach.primaryStorage",
        defaultMessage: "Attach Data Storage",
      }),
      "virtualization.detach.primaryStorage": intl.formatMessage({
        id: "virtualization.detach.primaryStorage",
        defaultMessage: "Detach Data Storage",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
      "virtualization.nvmeServer.attach.cluster": intl.formatMessage({
        id: "virtualization.attach",
        defaultMessage: "Attach",
      }),
      "virtualization.nvmeServer.detach.cluster": intl.formatMessage({
        id: "virtualization.detach",
        defaultMessage: "Detach",
      }),
      "cluster.gpu.enable": intl.formatMessage({
        id: "enable",
        defaultMessage: "Enable ",
      }),
      "cluster.gpu.disable": intl.formatMessage({
        id: "disable",
        defaultMessage: "Disable",
      }),
      "cluster.gpu.set.share.type": intl.formatMessage({
        id: "set.shareMode",
        defaultMessage: "Set Sharing Mode",
      }),
      "cluster.gpu.generate": intl.formatMessage({
        id: "virtual.generate",
        defaultMessage: "Virtualization",
      }),
      "cluster.gpu.ungenerate": intl.formatMessage({
        id: "virtual.ungenerate",
        defaultMessage: "Virtualization Restoration",
      }),
      "cluster.pcidevice.enable": intl.formatMessage({
        id: "enable",
        defaultMessage: "Enable ",
      }),
      "cluster.pcidevice.disable": intl.formatMessage({
        id: "disable",
        defaultMessage: "Disable",
      }),
      "cluster.phynic.sriov.generate": intl.formatMessage({
        id: "sriovGenerate",
        defaultMessage: "SR-IOV",
      }),
      "cluster.phynic.sriov.ungenerate": intl.formatMessage({
        id: "sriovUngenerate",
        defaultMessage: "SR-IOV Ungenerate",
      }),
      "cluster.usb.rename": intl.formatMessage({
        id: "update.usb",
        defaultMessage: "Edit Device Name",
      }),
      "cluster.usb.start": intl.formatMessage({
        id: "enable",
        defaultMessage: "Enable ",
      }),
      "cluster.usb.stop": intl.formatMessage({
        id: "disbale",
        defaultMessage: "Disbale",
      }),
      "cluster.usb.attach.vm": intl.formatMessage({
        id: "attach.vm",
        defaultMessage: "Attach Virtual Machine",
      }),
      "cluster.usb.detach.vm": intl.formatMessage({
        id: "detach.vm",
        defaultMessage: "Detach Virtual Machine",
      }),
      "cluster.vgpu.enable": intl.formatMessage({
        id: "enable",
        defaultMessage: "Enable ",
      }),
      "cluster.vgpu.disable": intl.formatMessage({
        id: "disable",
        defaultMessage: "Disable",
      }),
      "cluster.vgpu.set.share.type": intl.formatMessage({
        id: "set.shareType",
        defaultMessage: "Set Sharing Mode",
      }),
    },
    host: {
      "create.instance": intl.formatMessage({
        id: "create.instance",
        defaultMessage: "New Virtual Machine",
      }),
      "virtualization.add.host": intl.formatMessage({
        id: "virtualization.add.host",
        defaultMessage: "Add Host",
      }),
      enable: intl.formatMessage({ id: "enable", defaultMessage: "Enable " }),
      disable: intl.formatMessage({ id: "disable", defaultMessage: "Disable" }),
      reconnection: intl.formatMessage({
        id: "reconnect",
        defaultMessage: "Reconnect",
      }),
      "power.control.power.on": intl.formatMessage({
        id: "power.on",
        defaultMessage: "",
      }),
      "power.control.power.off": intl.formatMessage({
        id: "power.off",
        defaultMessage: "",
      }),
      "power.control.reboot": intl.formatMessage({
        id: "reboot",
        defaultMessage: "",
      }),
      maintenance: intl.formatMessage({
        id: "enter.maintenanceMode",
        defaultMessage: "Enter Maintenance Mode",
      }),
      "exit.maintenanceMode": intl.formatMessage({
        id: "exit.maintenanceMode",
        defaultMessage: "Exit Maintenance Mode",
      }),
      "enter.web.terminal": intl.formatMessage({
        id: "enter.web.terminal",
        defaultMessage: "Enter Web Terminal",
      }),
      edit: intl.formatMessage({ id: "edit", defaultMessage: "Edit" }),
      "edit.config": intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      }),
      "virtualization.zskernel.create": intl.formatMessage({
        id: "virtualization.zskernel.create",
        defaultMessage: "New Kernel Adapter",
      }),
      "tag.management": intl.formatMessage({
        id: "tag.management",
        defaultMessage: "",
      }),
      "virtualization.set.resource.attribute": intl.formatMessage({
        id: "set.resource.attribute",
        defaultMessage: "",
      }),
      "add.bond": intl.formatMessage({
        id: "add.AggPort",
        defaultMessage: "Add Bond",
      }),
      "update.ipmi.info": intl.formatMessage({
        id: "update.ipmi.info",
        defaultMessage: "Modify IPMI Info",
      }),
      "update.ssh.info": intl.formatMessage({
        id: "update.ssh.info",
        defaultMessage: "Update SSH Information",
      }),
      "modify.password": intl.formatMessage({
        id: "update.ssh.password",
        defaultMessage: "Update SSH Password",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
      "attach.alarm": intl.formatMessage({
        id: "attach.alarm",
        defaultMessage: "Add Host to Alarm",
      }),
      "detach.alarm": intl.formatMessage({
        id: "detach.alarm",
        defaultMessage: "Remove Host form Alarm",
      }),
      "host.group.add.host": intl.formatMessage({
        id: "host.group.add.host",
        defaultMessage: "Add Host",
      }),
      "host.group.remove.host": intl.formatMessage({
        id: "host.group.remove.host",
        defaultMessage: "Remove Host",
      }),
      "virtualization.tag.attach.host": intl.formatMessage({
        id: "associate",
        defaultMessage: "Associate",
      }),
      "virtualization.tag.detach.tag": intl.formatMessage({
        id: "disassociate",
        defaultMessage: "Disassociate",
      }),
      "attach.to.l2VSwitch": intl.formatMessage({
        id: "join.bond",
        defaultMessage: "Join Uplink",
      }),
      "host.gpu.enable": intl.formatMessage({
        id: "enable",
        defaultMessage: "Enable ",
      }),
      "host.gpu.disable": intl.formatMessage({
        id: "disable",
        defaultMessage: "Disable",
      }),
      "host.gpu.set.share.type": intl.formatMessage({
        id: "set.shareMode",
        defaultMessage: "Set Sharing Mode",
      }),
      "host.gpu.generate": intl.formatMessage({
        id: "virtual.generate",
        defaultMessage: "Virtualization",
      }),
      "host.gpu.ungenerate": intl.formatMessage({
        id: "virtual.ungenerate",
        defaultMessage: "Virtualization Restoration",
      }),
      "host.pcidevice.enable": intl.formatMessage({
        id: "enable",
        defaultMessage: "Enable ",
      }),
      "host.pcidevice.disable": intl.formatMessage({
        id: "disable",
        defaultMessage: "Disable",
      }),
      "virtualization.toggle.passthrough": intl.formatMessage({
        id: "toggle.passthrough",
        defaultMessage: "Toggle Passthrough",
      }),
      "edit.physicalNic": intl.formatMessage({
        id: "edit.description",
        defaultMessage: "Edit Description",
      }),
      "edit.ip.address": intl.formatMessage({
        id: "modify.ip.address",
        defaultMessage: "Modify IP Address",
      }),
      "host.phynic.sriov.generate": intl.formatMessage({
        id: "sriovGenerate",
        defaultMessage: "SR-IOV",
      }),
      "host.phynic.sriov.ungenerate": intl.formatMessage({
        id: "sriovUngenerate",
        defaultMessage: "SR-IOV Ungenerate",
      }),
      "edit.lldpMode": intl.formatMessage({
        id: "edit.lldpMode",
        defaultMessage: "Modify",
      }),
      "batche.modify.lldpMode": intl.formatMessage({
        id: "batche.modify.lldpMode",
        defaultMessage: "Modify LLDP Mode in Bulk",
      }),
      "modify.lldpMode": intl.formatMessage({
        id: "modify.lldpMode",
        defaultMessage: "Modify LLDP Mode",
      }),
      "config.sriov": intl.formatMessage({
        id: "config.sriov",
        defaultMessage: "Configure SR-IOV",
      }),
      "host.scsi.lun.attach.vm": intl.formatMessage({
        id: "attach.vm",
        defaultMessage: "Attach Virtual Machine",
      }),
      "host.scsi.lun.detach.vm": intl.formatMessage({
        id: "detach.vm",
        defaultMessage: "Detach Virtual Machine",
      }),
      "virtualization.edit": intl.formatMessage({
        id: "host.edit.iqn.nqn",
        defaultMessage: "Modify Identifier",
      }),
      "host.usb.rename": intl.formatMessage({
        id: "update.usb",
        defaultMessage: "Edit Device Name",
      }),
      "host.usb.start": intl.formatMessage({
        id: "enable",
        defaultMessage: "Enable ",
      }),
      "host.usb.stop": intl.formatMessage({
        id: "disbale",
        defaultMessage: "Disbale",
      }),
      "set.shareType": intl.formatMessage({
        id: "set.share.type",
        defaultMessage: "Set Sharing Mode",
      }),
      "host.usb.attach.vm": intl.formatMessage({
        id: "attach.vm",
        defaultMessage: "Attach Virtual Machine",
      }),
      "host.usb.detach.vm": intl.formatMessage({
        id: "detach.vm",
        defaultMessage: "Detach Virtual Machine",
      }),
      "host.vgpu.enable": intl.formatMessage({
        id: "enable",
        defaultMessage: "Enable ",
      }),
      "host.vgpu.disable": intl.formatMessage({
        id: "disable",
        defaultMessage: "Disable",
      }),
      "host.vgpu.set.share.type": intl.formatMessage({
        id: "set.shareMode",
        defaultMessage: "Set Sharing Mode",
      }),
    },
    zone: {
      "virtualization.create.cluster": intl.formatMessage({
        id: "virtualization.create.cluster",
        defaultMessage: "New Cluster",
      }),
      "virtualization.create.baremetal.clsuter": intl.formatMessage({
        id: "create.baremetal.clsuter",
        defaultMessage: "New Bare Metal Cluster",
      }),
      "virtualization.add.dataStore": intl.formatMessage({
        id: "virtualization.add.dataStore",
        defaultMessage: "Add Data Storage",
      }),
      "virtualization.add.imageStore": intl.formatMessage({
        id: "virtualization.add.imageStore",
        defaultMessage: "Add Image Storage",
      }),
      "virtualization.create.l2network": intl.formatMessage({
        id: "virtualization.create.l2network",
        defaultMessage: "New Distributed Switch",
      }),
      "virtualization.create.instance.group": intl.formatMessage({
        id: "virtualization.create.instance.group",
        defaultMessage: "New VM Group",
      }),
      edit: intl.formatMessage({ id: "edit", defaultMessage: "Edit" }),
      "create.zone": intl.formatMessage({
        id: "create.zone",
        defaultMessage: "New Data Center",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
      load: intl.formatMessage({
        id: "remoteBackupServer.attach.zone",
        defaultMessage: "Attach Zone to Remote Server",
      }),
      uninstall: intl.formatMessage({
        id: "remoteBackupServer.detach.zone",
        defaultMessage: "Detach Zone from Remote Server",
      }),
      create: intl.formatMessage({
        id: "virtualization.create.zone",
        defaultMessage: "New Data Center",
      }),
    },
    "vm.dir.group": {
      "virtualization.create.sub.directory": intl.formatMessage({
        id: "create.sub.directory",
        defaultMessage: "Creat Sub-Group",
      }),
      "virtualization.create.vm": intl.formatMessage({
        id: "create.vm",
        defaultMessage: "New Virtual Machine",
      }),
      edit: intl.formatMessage({ id: "edit.name", defaultMessage: "Edit Name" }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
    },
    "vm.spec": {
      "virtualization.create.vm.spec": intl.formatMessage({
        id: "create.vm.spec",
        defaultMessage: "New VM Specification",
      }),
      "virtualization.edit.name.desc": intl.formatMessage({
        id: "edit.name.and.desc",
        defaultMessage: "Edit Name and Description",
      }),
      "virtualization.edit.config": intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      }),
      "virtualization.delete": intl.formatMessage({
        id: "delete",
        defaultMessage: "Delete",
      }),
    },
    "kms.provider": {
      create: intl.formatMessage({
        id: "create.kms.provider",
        defaultMessage: "Add Key Provider",
      }),
      "set.default": intl.formatMessage({
        id: "set.defaults",
        defaultMessage: "Set as Default",
      }),
      "edit.config": intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      }),
      backup: intl.formatMessage({ id: "backup", defaultMessage: "Backup" }),
      restore: intl.formatMessage({ id: "restore", defaultMessage: "Restore" }),
      "update.data.encryption.key": intl.formatMessage({
        id: "update.data.encryption.key",
        defaultMessage: "Rekey",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
    },
    "backup.storage": {
      "add.backup.storage": intl.formatMessage({
        id: "add.backupStorage",
        defaultMessage: "Add Image Storage",
      }),
      "add.image": intl.formatMessage({
        id: "add.image",
        defaultMessage: "Add Image",
      }),
      enable: intl.formatMessage({ id: "enable", defaultMessage: "Enable " }),
      disable: intl.formatMessage({ id: "disable", defaultMessage: "Disable" }),
      reconnect: intl.formatMessage({
        id: "reconnect",
        defaultMessage: "Reconnect",
      }),
      "virtualization.edit.nameandDescription": intl.formatMessage({
        id: "virtualization.edit.nameandDescription",
        defaultMessage: "Edit Name and Description",
      }),
      "modify.config": intl.formatMessage({
        id: "modify.config",
        defaultMessage: "Modify Configuration",
      }),
      "modify.advance.settings": intl.formatMessage({
        id: "modify.advance.settings",
        defaultMessage: "Modify Advanced Settings",
      }),
      "data.clean": intl.formatMessage({
        id: "data.clean",
        defaultMessage: "Cleanup Data",
      }),
      "update.password": intl.formatMessage({
        id: "update.password",
        defaultMessage: "Update Password",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
      "attach.alarm": intl.formatMessage({ id: "add", defaultMessage: "Add" }),
      "detach.alarm": intl.formatMessage({
        id: "remove",
        defaultMessage: "Remove",
      }),
      "backup.storage.add.ceph.mon": intl.formatMessage({
        id: "add.monNode",
        defaultMessage: "Add Monitoring Node",
      }),
      "backup.storage.modify.ssh.username": intl.formatMessage({
        id: "change.sshUsername",
        defaultMessage: "Modify SSH Username",
      }),
      "backup.storage.modify.ssh.password": intl.formatMessage({
        id: "change.sshPassword",
        defaultMessage: "Modify SSH Password",
      }),
      "backup.storage.modify.ssh.port": intl.formatMessage({
        id: "change.sshPort",
        defaultMessage: "Edit SSH Port",
      }),
      "backup.storage.modify.mon.port": intl.formatMessage({
        id: "change.monPort",
        defaultMessage: "Modify Mon Port",
      }),
      "backup.storage.delete.ceph.mon": intl.formatMessage({
        id: "delete.monNode",
        defaultMessage: "Delete Monitoring Node",
      }),
      "backup.storage.cleanup": intl.formatMessage({
        id: "cleanup",
        defaultMessage: "Cleanup",
      }),
    },
    image: {
      "add.image": intl.formatMessage({
        id: "add.image",
        defaultMessage: "Add Image",
      }),
      "virtualization.create.vm": intl.formatMessage({
        id: "virtualization.create.vm",
        defaultMessage: "New Virtual Machine",
      }),
      "export.image": intl.formatMessage({
        id: "export.image",
        defaultMessage: "Export Image",
      }),
      "sync.image": intl.formatMessage({
        id: "sync.image",
        defaultMessage: "Synchronize Image",
      }),
      "virtualization.edit.nameandDescription": intl.formatMessage({
        id: "virtualization.edit.nameandDescription",
        defaultMessage: "Edit Name and Description",
      }),
      "modify.config": intl.formatMessage({
        id: "modify.config",
        defaultMessage: "Modify Configuration",
      }),
      "storage.migrate": intl.formatMessage({
        id: "image.migrate.changeBackupStorage",
        defaultMessage: "Change Image Storage",
      }),
      "set.share.type": intl.formatMessage({
        id: "set.shareMode",
        defaultMessage: "Set Sharing Mode",
      }),
      "share.resource": intl.formatMessage({
        id: "share.resource",
        defaultMessage: "Share Resource",
      }),
      "cancel.share": intl.formatMessage({
        id: "cancel.share",
        defaultMessage: "Unshare",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
      recover: intl.formatMessage({ id: "recover", defaultMessage: "Recover" }),
      expunge: intl.formatMessage({
        id: "expunge",
        defaultMessage: "Expunge",
      }),
      download: intl.formatMessage({ id: "download", defaultMessage: "Download" }),
      "copy.url": intl.formatMessage({
        id: "copy.url",
        defaultMessage: "Copy URL",
      }),
      "delete.exported": intl.formatMessage({
        id: "export.list.delete",
        defaultMessage: "Delete Export List",
      }),
    },
    "vm.template": {
      "create.instance": intl.formatMessage({
        id: "create.instance",
        defaultMessage: "New Virtual Machine",
      }),
      "transform.to.instance": intl.formatMessage({
        id: "transform.to.instance",
        defaultMessage: "Convert to Virtual Machine",
      }),
      edit: intl.formatMessage({
        id: "edit.name.and.desc",
        defaultMessage: "Edit Name and Description",
      }),
      "edit.config": intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      }),
      "set.share.type": intl.formatMessage({
        id: "set.share.type",
        defaultMessage: "Set Sharing Mode",
      }),
      "change.owner": intl.formatMessage({
        id: "change.owner",
        defaultMessage: "Change Owner",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
      "share.resource": intl.formatMessage({
        id: "share.resource",
        defaultMessage: "Share Resource",
      }),
      "cancel.share": intl.formatMessage({
        id: "cancel.share",
        defaultMessage: "Unshare",
      }),
    },
    "primary.storage": {
      "add.data.storage": intl.formatMessage({
        id: "add.data.storage",
        defaultMessage: "Add Data Storage",
      }),
      "register.vm": intl.formatMessage({
        id: "register.vm",
        defaultMessage: "Register VM",
      }),
      start: intl.formatMessage({ id: "enable", defaultMessage: "Enable " }),
      stop: intl.formatMessage({ id: "disable", defaultMessage: "Disable" }),
      reconnection: intl.formatMessage({
        id: "reconnection",
        defaultMessage: "Reconnect",
      }),
      maintenance: intl.formatMessage({
        id: "enter.maintenanceMode",
        defaultMessage: "Enter Maintenance Mode",
      }),
      "set.ceph.token": intl.formatMessage({
        id: "set.ceph.access.token",
        defaultMessage: "Set  Distributed Storage  Enterprise Access Token",
      }),
      "edit.name.description": intl.formatMessage({
        id: "edit.name.description",
        defaultMessage: "Edit Name and Description",
      }),
      "virtualization.modify.advanced.config": intl.formatMessage({
        id: "virtualization.modify.advanced.config",
        defaultMessage: "Modify Advanced Settings",
      }),
      "virtualization.set.resource.attribute": intl.formatMessage({
        id: "set.resource.attribute",
        defaultMessage: "Set Custom Attribute",
      }),
      "consistency.check": intl.formatMessage({
        id: "consistency.check",
        defaultMessage: "Consistency Check",
      }),
      "virtualization.primarystorage.attach.to.cluster": intl.formatMessage({
        id: "attach.cluster",
        defaultMessage: "Attach Cluster",
      }),
      "virtualization.detach.from.cluster": intl.formatMessage({
        id: "detach.cluster",
        defaultMessage: "Detach Cluster",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
      "attach.in.cluster": intl.formatMessage({
        id: "cluster.attach.primaryStorage",
        defaultMessage: "Attach Primary Storage to Cluster",
      }),
      "detach.in.cluster": intl.formatMessage({
        id: "cluster.detach.primaryStorage",
        defaultMessage: "Detach Primary Storage from Cluster",
      }),
      "attach.alarm": intl.formatMessage({
        id: "alarm.add.primaryStorage",
        defaultMessage: "Add Primary Storage to Alarm",
      }),
      "detach.alarm": intl.formatMessage({
        id: "alarm.remove.primaryStorage",
        defaultMessage: "Remove Primary Storage from Alarm",
      }),
      "primary.storage.add.ceph.mon": intl.formatMessage({
        id: "add.monNode",
        defaultMessage: "Add Monitoring Node",
      }),
      "primary.storage.modify.ssh.username": intl.formatMessage({
        id: "change.sshUsername",
        defaultMessage: "Modify SSH Username",
      }),
      "primary.storage.modify.ssh.password": intl.formatMessage({
        id: "change.sshPassword",
        defaultMessage: "Modify SSH Password",
      }),
      "primary.storage.modify.ssh.port": intl.formatMessage({
        id: "change.sshPort",
        defaultMessage: "Edit SSH Port",
      }),
      "primary.storage.modify.mon.port": intl.formatMessage({
        id: "change.monPort",
        defaultMessage: "Modify Mon Port",
      }),
      "primary.storage.delete.ceph.mon": intl.formatMessage({
        id: "delete.monNode",
        defaultMessage: "Delete Monitoring Node",
      }),
      "primary.storage.cleanup": intl.formatMessage({
        id: "cleanup",
        defaultMessage: "Cleanup",
      }),
    },
    "l2.network": {
      "virtualization.create.l2.network": intl.formatMessage({
        id: "virtualization.create.l2.network",
        defaultMessage: "New Distributed Switch",
      }),
      "attach.in.baremetal.cluster": intl.formatMessage({
        id: "baremetal.cluster.attach.l2Network",
        defaultMessage: "Attach Distributed Switch to Bare Metal Cluster",
      }),
      "detach.in.baremetal.cluster": intl.formatMessage({
        id: "baremetal.cluster.detach.l2Network",
        defaultMessage: "Detach Distributed Switch from Bare Metal Cluster",
      }),
      "virtualization.create.l3network": intl.formatMessage({
        id: "virtualization.create.l3network",
        defaultMessage: "New Distributed Port Group",
      }),
      "virtualization.edit.nameandDescription": intl.formatMessage({
        id: "edit.nameandDescription",
        defaultMessage: "Edit Name and Description",
      }),
      "virtualization.set.resource.attribute": intl.formatMessage({
        id: "set.resource.attribute",
        defaultMessage: "Set Custom Attribute",
      }),
      "virtualization.set.shareType": intl.formatMessage({
        id: "set.shareType",
        defaultMessage: "Set Sharing Mode",
      }),
      "share.resource": intl.formatMessage({
        id: "share.resource",
        defaultMessage: "Share Resource",
      }),
      "cancel.share": intl.formatMessage({
        id: "cancel.share",
        defaultMessage: "Unshare",
      }),
      "virtualization.attach.cluster": intl.formatMessage({
        id: "add.cluster",
        defaultMessage: "Attach Cluster",
      }),
      "virtualization.detach.cluster": intl.formatMessage({
        id: "detach.cluster",
        defaultMessage: "Detach Cluster",
      }),
      "virtualization.delete": intl.formatMessage({
        id: "delete",
        defaultMessage: "Delete",
      }),
    },
    "flat.network": {
      "virtualization.create": intl.formatMessage({
        id: "newCreate",
        defaultMessage: "New Distributed Port Group",
      }),
      "virtualization.add.ipv4.range": intl.formatMessage({
        id: "add.Ipv4NetworkRange",
        defaultMessage: "Add IPv4 Range",
      }),
      "virtualization.add.ipv6.ipRange": intl.formatMessage({
        id: "add.ipv6NetworkRange",
        defaultMessage: "Add Pv6 Range",
      }),
      "virtualization.add.dns": intl.formatMessage({
        id: "add.dns",
        defaultMessage: "Add DNS",
      }),
      "virtualization.create.hostKernelInterface": intl.formatMessage({
        id: "virtualization.create.hostKernelInterface",
        defaultMessage: "New Kernel Adapter",
      }),
      "virtualization.edit.name.and.description": intl.formatMessage({
        id: "edit.name.and.description",
        defaultMessage: "Edit Name and Description",
      }),
      "virtualization.edit.config": intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      }),
      "virtualization.set.resource.attribute": intl.formatMessage({
        id: "set.resource.attribute",
        defaultMessage: "Set Custom Attribute",
      }),
      "virtualization.set.shareType": intl.formatMessage({
        id: "set.shareType",
        defaultMessage: "Set Sharing Mode",
      }),
      "share.resource": intl.formatMessage({
        id: "share.resource",
        defaultMessage: "Share Resource",
      }),
      "cancel.share": intl.formatMessage({
        id: "cancel.share",
        defaultMessage: "Unshare",
      }),
      "virtualization.delete": intl.formatMessage({
        id: "delete",
        defaultMessage: "Delete",
      }),
      "virtualization.create.l3network": intl.formatMessage({
        id: "virtualization.create.l3network",
        defaultMessage: "New Distributed Port Group",
      }),
    },
    "security.group": {
      "create.security.group": intl.formatMessage({
        id: "create.securityGroup",
        defaultMessage: "Create Security Group",
      }),
      edit: intl.formatMessage({ id: "edit", defaultMessage: "Edit" }),
      enable: intl.formatMessage({ id: "enable", defaultMessage: "Enable " }),
      disable: intl.formatMessage({ id: "disable", defaultMessage: "Disable" }),
      "virtualization.edit.nameandDescription": intl.formatMessage({
        id: "edit.nameandDescription",
        defaultMessage: "Edit Name and Description",
      }),
      "import.secrurityGroup.rules": intl.formatMessage({
        id: "import.secrurityGroup.rules",
        defaultMessage: "Import Rule",
      }),
      "export.secrurityGroup.rules": intl.formatMessage({
        id: "export.secrurityGroup.rules",
        defaultMessage: "Export Rule",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
      "bind.nic": intl.formatMessage({
        id: "securityGroup.bind.nic",
        defaultMessage: "Bind NIC to Security Group",
      }),
      "unbind.nic": intl.formatMessage({
        id: "securityGroup.unbind.nic",
        defaultMessage: "Detach NIC from Security Group",
      }),
    },
    "baremetal.cluster": {
      "add.baremetal.chassis": intl.formatMessage({
        id: "add.baremetal.chassis",
        defaultMessage: "Add Bare Metal Chassis",
      }),
      "add.baremetal.instance": intl.formatMessage({
        id: "add.baremetal.instance",
        defaultMessage: "New Bare Metal Instance",
      }),
      "create.baremetal.cluster": intl.formatMessage({
        id: "create.baremetal.cluster",
        defaultMessage: "New Bare Metal Cluster",
      }),
      edit: intl.formatMessage({
        id: "edit.name.and.desc",
        defaultMessage: "Edit Name and Description",
      }),
      enable: intl.formatMessage({ id: "enable", defaultMessage: "Enable " }),
      disable: intl.formatMessage({ id: "disable", defaultMessage: "Disable" }),
      "create.l2Network": intl.formatMessage({
        id: "create.l2Network",
        defaultMessage: "New Distributed Switch",
      }),
      "attach.l2network": intl.formatMessage({
        id: "attach.l2Network",
        defaultMessage: "Attach Distributed Switch",
      }),
      "detach.l2network": intl.formatMessage({
        id: "detach.l2Network",
        defaultMessage: "Detach Distributed Switch",
      }),
      "config.pxeServer": intl.formatMessage({
        id: "config.pxeServer",
        defaultMessage: "Attach Deployment Server",
      }),
      "reconnect.pxe.server": intl.formatMessage({
        id: "reconnect.pxe.server",
        defaultMessage: "Reconnect Deployment Server",
      }),
      "detach.pxe.server": intl.formatMessage({
        id: "detach.pxeServer",
        defaultMessage: "Detach Deployment Server",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
      "attach.in.pxe.server": intl.formatMessage({
        id: "pxe.server.attach.baremetalCluster",
        defaultMessage: "Attach Baremetal Cluster to Deployment Server",
      }),
      "detach.in.pxe.server": intl.formatMessage({
        id: "pxe.server.detach.baremetalCluster",
        defaultMessage: "Detach Baremetal Cluster from Deployment Server",
      }),
      "attach.in.l2network": intl.formatMessage({
        id: "l2network.attach.baremetalCluster",
        defaultMessage: "Attach Baremetal Cluster to L2 Network",
      }),
      "detach.in.l2network": intl.formatMessage({
        id: "l2network.detach.baremetalCluster",
        defaultMessage: "Detach Baremetal Cluster from L2 Network",
      }),
    },
    "baremetal.chassis": {
      "add.baremetal.chassis": intl.formatMessage({
        id: "add.baremetalChassis",
        defaultMessage: "Add Bare Metal Chassis",
      }),
      "add.baremetal.instance": intl.formatMessage({
        id: "add.baremetal.instance",
        defaultMessage: "New Bare Metal Instance",
      }),
      enable: intl.formatMessage({ id: "enable", defaultMessage: "Enable " }),
      disable: intl.formatMessage({ id: "disable", defaultMessage: "Disable" }),
      "power.on.chassis": intl.formatMessage({
        id: "powerOn",
        defaultMessage: "",
      }),
      "power.off.chassis": intl.formatMessage({
        id: "power.stop",
        defaultMessage: "",
      }),
      "reboot.chassis": intl.formatMessage({
        id: "restart",
        defaultMessage: "",
      }),
      "open.console": intl.formatMessage({
        id: "open.console",
        defaultMessage: "Launch Console",
      }),
      edit: intl.formatMessage({
        id: "edit.name.description",
        defaultMessage: "Edit Name and Description",
      }),
      "get.hardware.info": intl.formatMessage({
        id: "get.hardwareInfo",
        defaultMessage: "Obtain Hardware Information",
      }),
      "update.bareMetalChassis.ipmiInfo": intl.formatMessage({
        id: "update.bareMetalChassis.ipmiInfo",
        defaultMessage: "Update IPMI Info",
      }),
      "delete.baremetal.chassis": intl.formatMessage({
        id: "delete",
        defaultMessage: "Delete",
      }),
    },
    "baremetal.instance": {
      "creat.baremetal.instance": intl.formatMessage({
        id: "create.baremetalInstance",
        defaultMessage: "New Bare Metal Instance",
      }),
      start: intl.formatMessage({ id: "start", defaultMessage: "Start" }),
      stop: intl.formatMessage({ id: "stop", defaultMessage: "Stop" }),
      rebort: intl.formatMessage({ id: "rebort", defaultMessage: "Reboot" }),
      "open.console": intl.formatMessage({
        id: "open.console",
        defaultMessage: "Launch Console",
      }),
      edit: intl.formatMessage({
        id: "edit.name.and.desc",
        defaultMessage: "Edit Name and Description",
      }),
      "tag.management": intl.formatMessage({
        id: "tag.management",
        defaultMessage: "Tag Management",
      }),
      "virtualization.set.resource.attribute": intl.formatMessage({
        id: "set.resource.attribute",
        defaultMessage: "",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
      recover: intl.formatMessage({ id: "recover", defaultMessage: "Recover" }),
      expunge: intl.formatMessage({
        id: "expunge",
        defaultMessage: "Expunge",
      }),
      "attach.alarm": intl.formatMessage({
        id: "alarm.attach.baremetalInstance",
        defaultMessage: "Remove Bare Metal Instance from Alarm",
      }),
      "detach.alarm": intl.formatMessage({
        id: "alarm.detach.baremetalInstance",
        defaultMessage: "Remove Bare Metal Instance from Alarm",
      }),
    },
    "pre.config.template": {
      edit: intl.formatMessage({
        id: "edit.name.and.desc",
        defaultMessage: "Edit Name and Description",
      }),
      "add.preconfigurationTemplate": intl.formatMessage({
        id: "add.preConfigurationTemplate",
        defaultMessage: "Add Bare Metal Template",
      }),
      start: intl.formatMessage({ id: "enable", defaultMessage: "Enable " }),
      stop: intl.formatMessage({ id: "disable", defaultMessage: "Disable" }),
      donwload: intl.formatMessage({ id: "download", defaultMessage: "Download" }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
    },
    "mn.monitoring": {},
    "dynamic.resource.ispatch.strategy": {
      "virtualization.enabled": intl.formatMessage({
        id: "virtualization.open",
        defaultMessage: "Enable",
      }),
      "virtualization.closed": intl.formatMessage({
        id: "virtualization.closed",
        defaultMessage: "Disabled",
      }),
      "close.dynamic.resource.ispatch": intl.formatMessage({
        id: "close.dynamic.resource.ispatch",
        defaultMessage: "Disable DRS",
      }),
      stateScan: intl.formatMessage({
        id: "stateScan",
        defaultMessage: "Scan Status",
      }),
      "change.strategy": intl.formatMessage({
        id: "change.strategy",
        defaultMessage: "Modify Policy",
      }),
    },
    "vm.scheduling.rule": {
      "create.vmSchedulingRule": intl.formatMessage({
        id: "create.vmSchedulingRule",
        defaultMessage: "New VM Scheduling Policy",
      }),
      edit: intl.formatMessage({ id: "edit", defaultMessage: "Edit" }),
      enable: intl.formatMessage({ id: "enable", defaultMessage: "Enable " }),
      disable: intl.formatMessage({ id: "disable", defaultMessage: "Disable" }),
      "modify.config": intl.formatMessage({
        id: " virtualization.modifyConfig",
        defaultMessage: "Modify Configuration",
      }),
      "modify.excuteMode": intl.formatMessage({
        id: "modify.excuteMode",
        defaultMessage: "Change Execution Mechanism",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
    },
    "vm.group": {
      "create.vm.group": intl.formatMessage({
        id: "create.vmGroup",
        defaultMessage: "New VM Scheduling Group",
      }),
      edit: intl.formatMessage({ id: "edit", defaultMessage: "Edit" }),
      "add.vm": intl.formatMessage({
        id: "add.vm",
        defaultMessage: "Add Virtual Machine",
      }),
      "remove.vm": intl.formatMessage({
        id: "remove.vm",
        defaultMessage: "Remove Virtual Machine",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
    },
    "host.group": {
      "create.host.group": intl.formatMessage({
        id: "create.hostGroup",
        defaultMessage: "New Host Scheduling Group",
      }),
      edit: intl.formatMessage({ id: "edit", defaultMessage: "Edit" }),
      "add.host": intl.formatMessage({
        id: "add.host",
        defaultMessage: "Add Host",
      }),
      "remove.host": intl.formatMessage({
        id: "remove.host",
        defaultMessage: "Remove Host",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
    },
    "ha.strategic": {},
    snapshot: {
      "create.snapshot": intl.formatMessage({
        id: "create.snapshot",
        defaultMessage: "Create Snapshot",
      }),
      "create.vm": intl.formatMessage({
        id: "create.vm",
        defaultMessage: "New Virtual Machine",
      }),
      "edit.name.description": intl.formatMessage({
        id: "edit.name.description",
        defaultMessage: "Edit Name and Description",
      }),
      revert: intl.formatMessage({ id: "revert", defaultMessage: "Revert" }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
      start: intl.formatMessage({ id: "start", defaultMessage: "Start" }),
      stop: intl.formatMessage({ id: "stop", defaultMessage: "Stop" }),
    },
    "snapshot.strategy": {
      "virtualization.create": intl.formatMessage({
        id: "create.snapshot.strategy",
        defaultMessage: "New Snapshot Policy",
      }),
      "virtualization.enable": intl.formatMessage({
        id: "enable.zsv",
        defaultMessage: "Enable",
      }),
      "virtualization.disable": intl.formatMessage({
        id: "disable.zsv",
        defaultMessage: "Disable",
      }),
      "virtualization.editNameDescription": intl.formatMessage({
        id: "edit.name.and.desc",
        defaultMessage: "Edit Name and Description",
      }),
      "virtualization.edit": intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      }),
      "virtualization.delete": intl.formatMessage({
        id: "delete.zsv",
        defaultMessage: "Delete",
      }),
      "virtualization.snapshotStrategy.attachVm": intl.formatMessage({
        id: "add.vm",
        defaultMessage: "Add Virtual Machine",
      }),
      "virtualization.snapshotStrategy.detachVm": intl.formatMessage({
        id: "remove.vm",
        defaultMessage: "Remove Virtual Machine",
      }),
    },
    "disaster.recovery.service.deployment": {},
    "zsv.backup.data": {
      "create.backup": intl.formatMessage({
        id: "create.backup",
        defaultMessage: "Create Backup",
      }),
      "overwrite.recovery": intl.formatMessage({
        id: "overwrite.recovery",
        defaultMessage: "Restore",
      }),
      "create.vm": intl.formatMessage({
        id: "create.vm",
        defaultMessage: "New Virtual Machine",
      }),
      "sync.to.remote.backup.storage": intl.formatMessage({
        id: "sync.to.remote.backup.storage",
        defaultMessage: "Sync to Remote Backup Storage",
      }),
      "sync.to.local.backup.storage": intl.formatMessage({
        id: "sync.to.local.backup.storage",
        defaultMessage: "Sync to Local Backup Storage",
      }),
      "change.owner": intl.formatMessage({
        id: "change.owner",
        defaultMessage: "Change Owner",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
    },
    "local.backup.data.db": {
      "cover.revert": intl.formatMessage({
        id: "cover.revert",
        defaultMessage: "Restore",
      }),
      recover: intl.formatMessage({ id: "restore", defaultMessage: "Restore" }),
      scan: intl.formatMessage({
        id: "scan.database.backup",
        defaultMessage: "Scan Platform Database Backup",
      }),
      export: intl.formatMessage({ id: "export", defaultMessage: "Export " }),
      "sync.db.to.remote": intl.formatMessage({
        id: "sync.to.remote",
        defaultMessage: "Sync to Remote",
      }),
      "sync.to.local.backupStorage": intl.formatMessage({
        id: "sync.to.local.backupStorage",
        defaultMessage: "Sync to Local Backup Storage",
      }),
      "sync.to.remote.backupStorage": intl.formatMessage({
        id: "sync.to.remote.backupStorage",
        defaultMessage: "Sync to Remote Backup Storage",
      }),
      "delete.db": intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
    },
    "backup.job": {
      create: intl.formatMessage({
        id: "create.backup.policy",
        defaultMessage: "New Backup Plan",
      }),
      enable: intl.formatMessage({ id: "enable", defaultMessage: "Enable " }),
      disable: intl.formatMessage({ id: "disable", defaultMessage: "Disable" }),
      triggerNow: intl.formatMessage({
        id: "backup.now",
        defaultMessage: "Backup Now",
      }),
      editNameDesc: intl.formatMessage({
        id: "edit.name.and.desc",
        defaultMessage: "Edit Name and Description",
      }),
      editBasicConfig: intl.formatMessage({
        id: "edit.basic.config",
        defaultMessage: "Modify Basic Settings",
      }),
      editBackupPolicy: intl.formatMessage({
        id: "edit.backup.policy",
        defaultMessage: "Modify Backup Policy",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
    },
    "zsv.backup.storage": {
      enable: intl.formatMessage({ id: "enable", defaultMessage: "Enable " }),
      disable: intl.formatMessage({ id: "disable", defaultMessage: "Disable" }),
      reconnet: intl.formatMessage({ id: "reconnet", defaultMessage: "Reconnect" }),
      "scan.backup.data": intl.formatMessage({
        id: "scan.backup.data",
        defaultMessage: "Scan Backup Data",
      }),
      "data.clear": intl.formatMessage({
        id: "data.clear",
        defaultMessage: "Cleanup Data",
      }),
      "edit.name.and.desc": intl.formatMessage({
        id: "edit.name.and.desc",
        defaultMessage: "Edit Name and Description",
      }),
      "modify.config": intl.formatMessage({
        id: "modify.config",
        defaultMessage: "Modify Configuration",
      }),
      "update.password": intl.formatMessage({
        id: "update.password",
        defaultMessage: "Update Password",
      }),
      "create.backup.storage": intl.formatMessage({
        id: "create.backup.storage",
        defaultMessage: "Add Backup Storage",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
    },
    "alarm.platform.message": {
      "mark.as.readed.single": intl.formatMessage({
        id: "alarm.message.mark.as.confirmed",
        defaultMessage: "Acknowledge",
      }),
      "all.mark.read": intl.formatMessage({
        id: "all.markRead",
        defaultMessage: "Mark All as Read",
      }),
      "handle.message": intl.formatMessage({
        id: "handle.message",
        defaultMessage: "Set Silence Period",
      }),
      "recover.alarm": intl.formatMessage({
        id: "recover.alarm",
        defaultMessage: "Restore Alarm",
      }),
    },
    "third.party.alert": {
      "virtualization.mark.as.readed.single": intl.formatMessage({
        id: "alarm.message.mark.as.confirmed",
        defaultMessage: "Acknowledge",
      }),
      "mark.all.as.read": intl.formatMessage({
        id: "mark.all.as.read",
        defaultMessage: "Mark All as Read",
      }),
    },
    "zwatch.alarm.resource": {
      "create.reource.alarm": intl.formatMessage({
        id: "create.resourceAlarm",
        defaultMessage: "New Resource Alarm",
      }),
      enable: intl.formatMessage({ id: "enable", defaultMessage: "Enable " }),
      "enable.zsv": intl.formatMessage({
        id: "enable.zsv",
        defaultMessage: "Enable",
      }),
      "disable.zsv": intl.formatMessage({
        id: "disable.zsv",
        defaultMessage: "Disable",
      }),
      disable: intl.formatMessage({ id: "disable", defaultMessage: "Disable" }),
      edit: intl.formatMessage({ id: "edit", defaultMessage: "Edit" }),
      "edit.zsv": intl.formatMessage({
        id: "virtualization.edit.name.and.description",
        defaultMessage: "Edit Name and Description",
      }),
      editConfig: intl.formatMessage({
        id: "editConfig",
        defaultMessage: "Modify Configuration",
      }),
      "add.alarm": intl.formatMessage({
        id: "add.alarm",
        defaultMessage: "Add Alarm",
      }),
      "remove.alarm": intl.formatMessage({
        id: "remove.alarm",
        defaultMessage: "Remove Alarm",
      }),
      "add.endpoint.to.resource.alarm": intl.formatMessage({
        id: "add.endpoint",
        defaultMessage: "Add Endpoint",
      }),
      "remove.endpoint.from.resource.alarm": intl.formatMessage({
        id: "remove.endpoint",
        defaultMessage: "Remove Endpoint",
      }),
      "delete.resource.alarm": intl.formatMessage({
        id: "delete",
        defaultMessage: "Delete",
      }),
    },
    "zwatch.alarm.event": {
      enable: intl.formatMessage({ id: "enable", defaultMessage: "Enable " }),
      disable: intl.formatMessage({ id: "disable", defaultMessage: "Disable" }),
      "add.endpoint.to.event.alarm": intl.formatMessage({
        id: "add.endpoint",
        defaultMessage: "Add Endpoint",
      }),
      "remove.endpoint.from.event.alarm": intl.formatMessage({
        id: "remove.endpoint",
        defaultMessage: "Remove Endpoint",
      }),
      "create.event.alarm": intl.formatMessage({
        id: "create.eventAlarm",
        defaultMessage: "New Event Alarm",
      }),
      editConfig: intl.formatMessage({
        id: "virtualization.modifyConfig",
        defaultMessage: "Modify Configuration",
      }),
      "create.zsv": intl.formatMessage({
        id: "create.zsv",
        defaultMessage: "New Event Alarm",
      }),
      "enable.zsv": intl.formatMessage({
        id: "enable.zsv",
        defaultMessage: "Enable",
      }),
      "disable.zsv": intl.formatMessage({
        id: "disable.zsv",
        defaultMessage: "Disable",
      }),
      "modifyconfig.zsv": intl.formatMessage({
        id: "modifyconfig.zsv",
        defaultMessage: "Modify Configuration",
      }),
      "add.endpoint.zsv": intl.formatMessage({
        id: "add.endpoint.zsv",
        defaultMessage: "Add Endpoint",
      }),
      "remove.endpoint.zsv": intl.formatMessage({
        id: "remove.endpoint.zsv",
        defaultMessage: "Remove Endpoint",
      }),
      "delete.event.alarm": intl.formatMessage({
        id: "delete",
        defaultMessage: "Delete",
      }),
      "delete.zsv": intl.formatMessage({
        id: "delete.zsv",
        defaultMessage: "Delete",
      }),
    },
    "zwatch.alarm.storage": {
      refetch: intl.formatMessage({ id: "refetch", defaultMessage: "Refresh" }),
      "virtualization.enable": intl.formatMessage({
        id: "virtualization.enable",
        defaultMessage: "Enable",
      }),
      "virtualization.disable": intl.formatMessage({
        id: "virtualization.disable",
        defaultMessage: "Disable",
      }),
      "virtualization.edit.config": intl.formatMessage({
        id: "virtualization.edit.config",
        defaultMessage: "Modify Configuration",
      }),
    },
    "monitor.template": {
      "create.monitor.template": intl.formatMessage({
        id: "create.monitorTemplate",
        defaultMessage: "Create Alarm Template",
      }),
      edit: intl.formatMessage({ id: "edit", defaultMessage: "Edit" }),
      clone: intl.formatMessage({ id: "clone", defaultMessage: "Clone" }),
      "set.share.type": intl.formatMessage({
        id: "set.shareType",
        defaultMessage: "Set Sharing Mode",
      }),
      "attach.tag": intl.formatMessage({
        id: "attach.tag",
        defaultMessage: "Attach Tag",
      }),
      "detach.tag": intl.formatMessage({
        id: "detach.tag",
        defaultMessage: "Detach Tag",
      }),
      "attach.monitor.group": intl.formatMessage({
        id: "associate.MonitorGroup",
        defaultMessage: "Attach Resource Group",
      }),
      "detach.monitor.group": intl.formatMessage({
        id: "disassociate.monitorGroup",
        defaultMessage: "Detach Resource Group",
      }),
      "modify.alarmRule": intl.formatMessage({
        id: "modify.alarmRule",
        defaultMessage: "Modify Alarm Rules",
      }),
      "sync.rule.to.group": intl.formatMessage({
        id: "sync.rule.to.group",
        defaultMessage: "Sync Rules to Resource Group",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
      "attach.resource.tag": intl.formatMessage({
        id: "bind",
        defaultMessage: "Associate",
      }),
      detach: intl.formatMessage({
        id: "disassociate",
        defaultMessage: "Disassociate",
      }),
    },
    "zwatch.endpoint": {
      "create.zwatchEndpoint": intl.formatMessage({
        id: "create.zwatchEndpoint",
        defaultMessage: "New Endpoint",
      }),
      enable: intl.formatMessage({ id: "enable", defaultMessage: "Enable " }),
      disable: intl.formatMessage({ id: "disable", defaultMessage: "Disable" }),
      edit: intl.formatMessage({ id: "edit", defaultMessage: "Edit" }),
      "edit.zsv": intl.formatMessage({
        id: "virtualization.edit.name.and.description",
        defaultMessage: "Edit Name and Description",
      }),
      editConfig: intl.formatMessage({
        id: "editConfig",
        defaultMessage: "Modify Configuration",
      }),
      "add.alarm": intl.formatMessage({
        id: "add.alarm",
        defaultMessage: "Add Alarm",
      }),
      "remove.alarm": intl.formatMessage({
        id: "remove.alarm",
        defaultMessage: "Remove Alarm",
      }),
      "remove.endpoint.in.resource.row": intl.formatMessage({
        id: "remove.endpoint",
        defaultMessage: "Remove Endpoint",
      }),
      "remove.endpoint.in.event.row": intl.formatMessage({
        id: "remove.endpoint",
        defaultMessage: "Remove Endpoint",
      }),
      "test.message": intl.formatMessage({
        id: "test.message",
        defaultMessage: "Test Text Message",
      }),
      "send.testMsg": intl.formatMessage({
        id: "send.testMsg",
        defaultMessage: "Send Test Message",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
      "add.in.alarm.resource": intl.formatMessage({
        id: "resource.alarm.add.zwatchEndpoint",
        defaultMessage: "Add Endpoint to Resource Alarm",
      }),
      "remove.in.alarm.resource": intl.formatMessage({
        id: "resource.alarm.remove.zwatchEndpoint",
        defaultMessage: "Remove Endpoint from Resource Alarm",
      }),
      "add.in.alarm.event": intl.formatMessage({
        id: "event.alarm.add.zwatchEndpoint",
        defaultMessage: "Add Endpoint to Event Alarm",
      }),
      "remove.in.alarm.event": intl.formatMessage({
        id: "event.alarm.remove.zwatchEndpoint",
        defaultMessage: "Remove Endpoint from Event Alarm",
      }),
      "add.in.alarm.third.party": intl.formatMessage({
        id: "third.party.alarm.add.zwatchEndpoint",
        defaultMessage: "Add Endpoint to Extended Alarm",
      }),
      "remove.in.alarm.third.party": intl.formatMessage({
        id: "third.party.alarm.remove.zwatchEndpoint",
        defaultMessage: "Remove Endpoint from Extended Alarm",
      }),
      "add.in.monitor.group": intl.formatMessage({
        id: "monitor.group.add.zwatchEndpoint",
        defaultMessage: "Add Endpoint to Resource Group",
      }),
      "remove.in.monitor.group": intl.formatMessage({
        id: "monitor.group.remove.zwatchEndpoint",
        defaultMessage: "Remove Endpoint from Resource Group",
      }),
    },
    "operation.log": {
      cancelTask: intl.formatMessage({
        id: "cancel.task",
        defaultMessage: "Cancel Task",
      }),
      suspend: intl.formatMessage({ id: "pause", defaultMessage: "Pause" }),
      goingOn: intl.formatMessage({ id: "going.on", defaultMessage: "Continue" }),
    },
    "migrate.log": {},
    "scheduling.task": {},
    auditing: {},
    "log.collect": {
      "collect.log": intl.formatMessage({
        id: "collect.log",
        defaultMessage: "Collect Log",
      }),
      "delete.all.log": intl.formatMessage({
        id: "delete.all.log",
        defaultMessage: "Delete All Logs",
      }),
      download: intl.formatMessage({ id: "download", defaultMessage: "Download" }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
    },
    tag: {
      "virtualization.create.tag": intl.formatMessage({
        id: "virtualization.create.tag",
        defaultMessage: "New Tag",
      }),
      "virtualization.bind.resource": intl.formatMessage({
        id: "virtualization.bind.resource",
        defaultMessage: "Attach Resource",
      }),
      "virtualization.edit.tag": intl.formatMessage({
        id: "virtualization.edit.config",
        defaultMessage: "Modify Configuration",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
    },
    "resource.attribute.key": {
      create: intl.formatMessage({
        id: "create.resource.attribute.key",
        defaultMessage: "New Custom Attribute",
      }),
      edit: intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      }),
      "add.value": intl.formatMessage({
        id: "add.resource.attribute.value",
        defaultMessage: "Add Attribute Value",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
    },
    "migration.service": {},
    "zmigrate.resource": {},
    "zmigrate.task": {},
    "script.library": {},
    "xml.hook": {},
    "account.information": {
      "create.account": intl.formatMessage({
        id: "create.subAccount",
        defaultMessage: "Create User",
      }),
      edit: intl.formatMessage({ id: "edit", defaultMessage: "Edit" }),
      "editor.password": intl.formatMessage({
        id: "change.password",
        defaultMessage: "Change Password",
      }),
      "bind.to.price.table": intl.formatMessage({
        id: "bind.accountInformation",
        defaultMessage: "Bind User",
      }),
      "modify.price.table": intl.formatMessage({
        id: "change.pricingList",
        defaultMessage: "Change Pricing List",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
      "virtualization.new.user": intl.formatMessage({
        id: "virtualization.new.user",
        defaultMessage: "New User",
      }),
      enable: intl.formatMessage({ id: "enable.zsv", defaultMessage: "Enable" }),
      disabled: intl.formatMessage({
        id: "disabled.zsv",
        defaultMessage: "Disable",
      }),
      "virtualization.edit.user.info": intl.formatMessage({
        id: "virtualization.edit.user.info",
        defaultMessage: "Edit User Information",
      }),
      "modify.config": intl.formatMessage({
        id: "modify.config",
        defaultMessage: "Modify Configuration",
      }),
      "virtualization.edit.password": intl.formatMessage({
        id: "virtualization.edit.password",
        defaultMessage: "Change Password",
      }),
      "change.to.administrator.user": intl.formatMessage({
        id: "change.to.administrator.user",
        defaultMessage: "Change to Admin User",
      }),
      "bind.role": intl.formatMessage({
        id: "bind.role",
        defaultMessage: "Assign Role",
      }),
      "join.user.group": intl.formatMessage({
        id: "join.user.group",
        defaultMessage: "Join User Group",
      }),
      "share.resource": intl.formatMessage({
        id: "share.resource",
        defaultMessage: "Share Resource",
      }),
      "add.user": intl.formatMessage({
        id: "add.user",
        defaultMessage: "Add User",
      }),
      "remove.user": intl.formatMessage({
        id: "remove.user",
        defaultMessage: "Remove User",
      }),
      shared: intl.formatMessage({ id: "shared", defaultMessage: "Share" }),
      recall: intl.formatMessage({ id: "recall", defaultMessage: "Unshare" }),
      "virtualization.delete": intl.formatMessage({
        id: "delete",
        defaultMessage: "Delete",
      }),
    },
    "zsv.user.group": {
      "create.user.group": intl.formatMessage({
        id: "create.user.group",
        defaultMessage: "New User Group",
      }),
      "add.user": intl.formatMessage({
        id: "add.user",
        defaultMessage: "Add User",
      }),
      "bind.role": intl.formatMessage({
        id: "bind.role",
        defaultMessage: "Assign Role",
      }),
      "virtualization.sharedResource": intl.formatMessage({
        id: "virtualization.sharedResource",
        defaultMessage: "Share Resource",
      }),
      "modifyconfig.zsv": intl.formatMessage({
        id: "modifyconfig.zsv",
        defaultMessage: "Modify Configuration",
      }),
      share: intl.formatMessage({ id: "share", defaultMessage: "Share" }),
      recall: intl.formatMessage({ id: "recall", defaultMessage: "Unshare" }),
      "join.userGroup": intl.formatMessage({
        id: "virtualization.join.user.group",
        defaultMessage: "Join User Group",
      }),
      "remove.from.user.group": intl.formatMessage({
        id: "remove.from.user.group",
        defaultMessage: "Remove from User Group",
      }),
      "virtualization.delete": intl.formatMessage({
        id: "virtualization.delete",
        defaultMessage: "Delete",
      }),
    },
    "zsv.role": {
      "create.role": intl.formatMessage({
        id: "create.role",
        defaultMessage: "New Role",
      }),
      "virtualization.edit.config": intl.formatMessage({
        id: "virtualization.edit.config",
        defaultMessage: "Modify Configuration",
      }),
      "clone.role": intl.formatMessage({
        id: "clone.role",
        defaultMessage: "Clone Role",
      }),
      "virtualization.delete": intl.formatMessage({
        id: "virtualization.delete",
        defaultMessage: "Delete",
      }),
    },
    "account.third.party.auth": {
      sync: intl.formatMessage({ id: "sync", defaultMessage: "Synchronize" }),
      testConnect: intl.formatMessage({
        id: "test.connect",
        defaultMessage: "Test Connection",
      }),
      "virtualization.edit.name.and.description": intl.formatMessage({
        id: "edit.name.and.description",
        defaultMessage: "Edit Name and Description",
      }),
      "virtualization.edit.config": intl.formatMessage({
        id: "virtualization.edit.config",
        defaultMessage: "Modify Configuration",
      }),
      "virtualization.edit.info": intl.formatMessage({
        id: "edit.config.info",
        defaultMessage: "Modify Configuration",
      }),
      "modify.rulesMapping": intl.formatMessage({
        id: "modify.rulesMapping",
        defaultMessage: "Modify Mapping Rule",
      }),
      "virtualization.delete": intl.formatMessage({
        id: "delete",
        defaultMessage: "Delete",
      }),
      "virtualization.create": intl.formatMessage({
        id: "create",
        defaultMessage: "Create",
      }),
    },
    "access.control.rule": {
      "virtualization.add.accessControlRule": intl.formatMessage({
        id: "virtualization.add.accessControlRule",
        defaultMessage: "Add IP Allowlist/Blocklist",
      }),
      edit: intl.formatMessage({ id: "edit", defaultMessage: "Edit" }),
      "modify.config": intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
    },
    "https.certificate": {
      "virtualization.import.certification": intl.formatMessage({
        id: "virtualization.import.certification",
        defaultMessage: "Import New Certificate",
      }),
      "virtualization.restore.default": intl.formatMessage({
        id: "virtualization.restore.http",
        defaultMessage: "Switch to HTTP",
      }),
      "virtualization.import.certification.http": intl.formatMessage({
        id: "virtualization.import.certification.http",
        defaultMessage: "Certificate of Import",
      }),
    },
    "login.policy": {},
    "accesskey.management.local": {
      create: intl.formatMessage({
        id: "generate.accesskey",
        defaultMessage: "Generate AccessKey",
      }),
      start: intl.formatMessage({ id: "enbale", defaultMessage: "Enable" }),
      stop: intl.formatMessage({ id: "disable", defaultMessage: "Disable" }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
    },
    "console.proxy": {
      "reconnect.consoleproxy": intl.formatMessage({
        id: "reconnect.consoleproxy",
        defaultMessage: "Reconnect",
      }),
      "update.consoleproxy": intl.formatMessage({
        id: "set.consoleproxy.adress",
        defaultMessage: "Set Console Proxy Address",
      }),
    },
    snmp: {
      "edit.config": intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      }),
      "download.mib.file": intl.formatMessage({
        id: "download.mib.file",
        defaultMessage: "Download MIB",
      }),
      disable: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
    },
    "time.server": {
      "edit.config": intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      }),
      "ntp.sync.time": intl.formatMessage({
        id: "ntp.sync.time",
        defaultMessage: "Sync Time",
      }),
    },
    "log.server": {
      edit: intl.formatMessage({ id: "edit", defaultMessage: "Edit" }),
      "create.logServer": intl.formatMessage({
        id: "add.logServer",
        defaultMessage: "Add Log Server",
      }),
      test: intl.formatMessage({
        id: "test.connect",
        defaultMessage: "Test Connection",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
    },
    "email.server": {
      "create.emailServerSetting": intl.formatMessage({
        id: "add.emailServer",
        defaultMessage: "Add Email Server",
      }),
      start: intl.formatMessage({ id: "enable", defaultMessage: "Enable " }),
      stop: intl.formatMessage({ id: "disable", defaultMessage: "Disable" }),
      edit: intl.formatMessage({ id: "edit", defaultMessage: "Edit" }),
      validate: intl.formatMessage({ id: "test", defaultMessage: "Test" }),
      changeOwner: intl.formatMessage({
        id: "change.owner",
        defaultMessage: "Change Owner",
      }),
      "set.share.mode": intl.formatMessage({
        id: "set.share.mode",
        defaultMessage: "Set Sharing Mode",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
      "cancel.share": intl.formatMessage({
        id: "cancel.share",
        defaultMessage: "Unshare",
      }),
    },
    "system.parameter": {},
    "license.management": {},
  };

  const subActionConfig: any = {
    "load.balancer": {
      "backend.server": {
        name: intl.formatMessage({
          id: "backend.server",
          defaultMessage: "***",
        }),
        keys: ["add.backend.server", "remove"],
      },
      "forwarding.strategy": {
        name: intl.formatMessage({
          id: "forwarding.strategy",
          defaultMessage: "***",
        }),
        keys: ["add.acl", "add.rule", "delete"],
      },
      "vm.nic": {
        name: intl.formatMessage({ id: "vm.nic", defaultMessage: "***" }),
        keys: ["attach.nic.in.load.balancer", "detach.nic.in.load.balancer"],
      },
    },
    "primary.storage": {
      "ceph.mon": {
        name: intl.formatMessage({ id: "ceph.mon", defaultMessage: "***" }),
        keys: [
          "primary.storage.add.ceph.mon",
          "primary.storage.modify.ssh.username",
          "primary.storage.modify.ssh.password",
          "primary.storage.modify.ssh.port",
          "primary.storage.modify.mon.port",
          "primary.storage.delete.ceph.mon",
        ],
      },
      trash: {
        name: intl.formatMessage({ id: "trash", defaultMessage: "***" }),
        keys: ["primary.storage.cleanup"],
      },
    },
    "backup.storage": {
      "ceph.mon": {
        name: intl.formatMessage({ id: "ceph.mon", defaultMessage: "***" }),
        keys: [
          "backup.storage.add.ceph.mon",
          "backup.storage.modify.ssh.username",
          "backup.storage.modify.ssh.password",
          "backup.storage.modify.ssh.port",
          "backup.storage.modify.mon.port",
          "backup.storage.delete.ceph.mon",
        ],
      },
      trash: {
        name: intl.formatMessage({ id: "trash", defaultMessage: "***" }),
        keys: ["backup.storage.cleanup"],
      },
    },
    cluster: {
      "gpu.device": {
        name: intl.formatMessage({ id: "gpu.device", defaultMessage: "***" }),
        keys: [
          "cluster.gpu.enable",
          "cluster.gpu.disable",
          "cluster.gpu.set.share.type",
          "cluster.gpu.generate",
          "cluster.gpu.ungenerate",
        ],
      },
      "pci.device": {
        name: intl.formatMessage({ id: "pci.device", defaultMessage: "***" }),
        keys: ["cluster.pcidevice.enable", "cluster.pcidevice.disable"],
      },
      "physical.nic": {
        name: intl.formatMessage({ id: "physical.nic", defaultMessage: "***" }),
        keys: [
          "cluster.phynic.sriov.generate",
          "cluster.phynic.sriov.ungenerate",
        ],
      },
      usb: {
        name: intl.formatMessage({ id: "usb", defaultMessage: "***" }),
        keys: [
          "cluster.usb.rename",
          "cluster.usb.start",
          "cluster.usb.stop",
          "cluster.usb.attach.vm",
          "cluster.usb.detach.vm",
        ],
      },
      "vgpu.device": {
        name: intl.formatMessage({ id: "vgpu.device", defaultMessage: "***" }),
        keys: [
          "cluster.vgpu.enable",
          "cluster.vgpu.disable",
          "cluster.vgpu.set.share.type",
        ],
      },
    },
    host: {
      "gpu.device": {
        name: intl.formatMessage({ id: "gpu.device", defaultMessage: "***" }),
        keys: [
          "host.gpu.enable",
          "host.gpu.disable",
          "host.gpu.set.share.type",
          "host.gpu.generate",
          "host.gpu.ungenerate",
        ],
      },
      "pci.device": {
        name: intl.formatMessage({ id: "pci.device", defaultMessage: "***" }),
        keys: [
          "host.pcidevice.enable",
          "host.pcidevice.disable",
          "virtualization.toggle.passthrough",
        ],
      },
      "physical.nic": {
        name: intl.formatMessage({ id: "physical.nic", defaultMessage: "***" }),
        keys: [
          "edit.physicalNic",
          "edit.ip.address",
          "host.phynic.sriov.generate",
          "host.phynic.sriov.ungenerate",
          "edit.lldpMode",
          "batche.modify.lldpMode",
          "modify.lldpMode",
          "config.sriov",
        ],
      },
      "scsi.lun": {
        name: intl.formatMessage({ id: "scsi.lun", defaultMessage: "***" }),
        keys: ["host.scsi.lun.attach.vm", "host.scsi.lun.detach.vm"],
      },
      "storage.adapter": {
        name: intl.formatMessage({
          id: "storage.adapter",
          defaultMessage: "***",
        }),
        keys: ["virtualization.edit"],
      },
      usb: {
        name: intl.formatMessage({ id: "usb", defaultMessage: "***" }),
        keys: [
          "host.usb.rename",
          "host.usb.start",
          "host.usb.stop",
          "set.shareType",
          "host.usb.attach.vm",
          "host.usb.detach.vm",
        ],
      },
      "vgpu.device": {
        name: intl.formatMessage({ id: "vgpu.device", defaultMessage: "***" }),
        keys: [
          "host.vgpu.enable",
          "host.vgpu.disable",
          "host.vgpu.set.share.type",
        ],
      },
    },
    vm: {
      "gpu.device": {
        name: intl.formatMessage({ id: "gpu.device", defaultMessage: "***" }),
        keys: ["attach.gpu.device", "dettach.gpu.device"],
      },
      "pci.device": {
        name: intl.formatMessage({ id: "pci.device", defaultMessage: "***" }),
        keys: ["attach.pci.device", "detach.pci.device"],
      },
      "scsi.lun": {
        name: intl.formatMessage({ id: "scsi.lun", defaultMessage: "***" }),
        keys: ["vm.scsi.lun.attach.vm", "vm.scsi.lun.detach.vm"],
      },
      usb: {
        name: intl.formatMessage({ id: "usb", defaultMessage: "***" }),
        keys: ["vm.attach.usb", "vm.detach.usb"],
      },
      "vgpu.device": {
        name: intl.formatMessage({ id: "vgpu.device", defaultMessage: "***" }),
        keys: ["attach.vgpu.device", "detach.vgpu.device"],
      },
      "vm.nic": {
        name: intl.formatMessage({ id: "vm.nic", defaultMessage: "***" }),
        keys: [
          "enable.nic.in.vm",
          "disable.nic.in.vm",
          "attach.nic.in.vm",
          "set.default.network",
          "set.nic.type",
          "set.mac",
          "set.ip",
          "sync.config",
          "set.nic.drive.type",
          "set.qos",
          "vmNic.set.securityGroup",
          "detach.nic.in.vm",
          "vm.nic.bind.eip",
          "vm.nic.unbind.eip",
        ],
      },
    },
    "flat.network": {
      "l2.network": {
        name: intl.formatMessage({ id: "l2.network", defaultMessage: "***" }),
        keys: ["virtualization.create.l3network"],
      },
    },
    "ipsec.tunnel": {
      "local.cidr": {
        name: intl.formatMessage({ id: "local.cidr", defaultMessage: "***" }),
        keys: ["localCidr.attach", "localCidr.detach"],
      },
      "peer.cidr": {
        name: intl.formatMessage({ id: "peer.cidr", defaultMessage: "***" }),
        keys: ["peerCidr.create", "peerCidr.delete"],
      },
    },
    "vpc.vrouter": {
      "ospf.tab": {
        name: intl.formatMessage({ id: "ospf.tab", defaultMessage: "***" }),
        keys: [
          "ospf.add.area",
          "ospf.quit.area",
          "ospf.attach.network",
          "ospf.detach.network",
        ],
      },
      "vm.nic": {
        name: intl.formatMessage({ id: "vm.nic", defaultMessage: "***" }),
        keys: [
          "create.vpc.network",
          "vpcrouter.enable.nic",
          "vpcrouter.disable.nic",
          "attach.to.vpcrouter",
          "detach.from.vpcrouter",
          "set.qos.in.router",
          "delete.vpc.network",
          "set.snat",
        ],
      },
    },
    "physical.network": {
      "physical.network.bond": {
        name: intl.formatMessage({
          id: "physical.network.bond",
          defaultMessage: "***",
        }),
        keys: ["modify.physicalNetwork.type"],
      },
      "physical.network.interface": {
        name: intl.formatMessage({
          id: "physical.network.interface",
          defaultMessage: "***",
        }),
        keys: ["modify.physicalNetwork.type"],
      },
    },
    bond: {
      "physical.nic": {
        name: intl.formatMessage({ id: "physical.nic", defaultMessage: "***" }),
        keys: ["add.physical.nic", "remove.physical.nic"],
      },
    },
    vip: {
      qos: {
        name: intl.formatMessage({ id: "qos", defaultMessage: "***" }),
        keys: ["create.qos", "delete.qos"],
      },
    },
    zone: {
      "root.node": {
        name: intl.formatMessage({ id: "root.node", defaultMessage: "***" }),
        keys: ["create"],
      },
    },
    "route.table": {
      "route.entry": {
        name: intl.formatMessage({ id: "route.entry", defaultMessage: "***" }),
        keys: ["create.route.entry", "delete.route.entry"],
      },
    },
    "database.backup": {
      "scheduler.job.history": {
        name: intl.formatMessage({
          id: "scheduler.job.history",
          defaultMessage: "***",
        }),
        keys: ["database.backup.history.detail"],
      },
    },
    "scheduled.job": {
      "scheduler.job.history": {
        name: intl.formatMessage({
          id: "scheduler.job.history",
          defaultMessage: "***",
        }),
        keys: ["scheduled.job.history.detail"],
      },
    },
    "snapshot.strategy": {
      vm: {
        name: intl.formatMessage({ id: "vm", defaultMessage: "***" }),
        keys: [
          "virtualization.snapshotStrategy.attachVm",
          "virtualization.snapshotStrategy.detachVm",
        ],
      },
    },
    "vcenter.vm": {
      "vm.nic": {
        name: intl.formatMessage({ id: "vm.nic", defaultMessage: "***" }),
        keys: ["attach.nic.in.vcenter.vm", "detach.nic.vcenter.vm"],
      },
    },
    "baremetal2.instance": {
      "vm.nic": {
        name: intl.formatMessage({ id: "vm.nic", defaultMessage: "***" }),
        keys: [
          "attach.in.baremetal2.instance",
          "detach.in.baremetal2.instance",
          "set.default.nic",
          "add.aggregated.nic",
          "remove.aggregated.nic",
        ],
      },
    },
    "security.group": {
      "vm.nic": {
        name: intl.formatMessage({ id: "vm.nic", defaultMessage: "***" }),
        keys: ["bind.nic", "unbind.nic"],
      },
    },
    l2network: {
      zone: {
        name: intl.formatMessage({ id: "zone", defaultMessage: "***" }),
        keys: ["virtualization.create.l2network"],
      },
    },
  };

  return {
    actionConfig,
    subActionConfig,
  };
}

export default getActionAuth;
