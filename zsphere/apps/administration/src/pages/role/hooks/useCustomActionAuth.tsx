function getCustomActionAuth(intl: any) {
  // TODO: 最初zsv&cloud在配置系统未能有一个标识区分这两，不论是通过useActionConfig里面的view，还是通过Admin.zsv.json里面的view，都没法区分。
  // 后续zsv&cloud的配置系统会有区分后，这个问题就能解
  const customActionConfig: any = {
    vm: {
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
      "backup.task.enable": intl.formatMessage({
        id: "backup.task.enable",
        defaultMessage: "Enable",
      }),
      "backup.task.disable": intl.formatMessage({
        id: "backup.task.disable",
        defaultMessage: "Disable",
      }),
      "vm.bind.in.sub.sshKey": intl.formatMessage({
        id: "bind",
        defaultMessage: "Associate",
      }),
      "vm.unbind.in.sub.sshKey": intl.formatMessage({
        id: "unbind",
        defaultMessage: "Disassociate",
      }),
      "set.share.type": intl.formatMessage({
        id: "set.share.type",
        defaultMessage: "Set Sharing Mode",
      }),
      editBackupPriority: intl.formatMessage({
        id: "edit.backup.priority",
        defaultMessage: "Modify Priority",
      }),
      backupPolicyAttachVm: intl.formatMessage({
        id: "virtualization.bind.vm",
        defaultMessage: "Associate Virtual Machine",
      }),
      backupPolicyDetachVm: intl.formatMessage({
        id: "virtualization.unbind.vm",
        defaultMessage: "Disassociate Virtual Machine",
      }),
      "share.resource": intl.formatMessage({
        id: "share.resource",
        defaultMessage: "Share Resource",
      }),
      "cancel.share": intl.formatMessage({
        id: "cancel.share",
        defaultMessage: "Unshare",
      }),
      recover: intl.formatMessage({ id: "recover", defaultMessage: "Recover" }),
      expunge: intl.formatMessage({
        id: "expunge",
        defaultMessage: "Expunge",
      }),
      "update.data.encryption.key": intl.formatMessage({
        id: "update.data.encryption.key",
        defaultMessage: "Rekey",
      }),
    },
    cluster: {
      "add.host": intl.formatMessage({
        id: "add.host",
        defaultMessage: "Add Host",
      }),
      "create.l3Network": intl.formatMessage({
        id: "virtualization.cluster.create.l3Network",
        defaultMessage: "New Distributed Switch",
      }),
      "add.dataStorage": intl.formatMessage({
        id: "add.dataStorage",
        defaultMessage: "Add Data Storage",
      }),
      edit: intl.formatMessage({ id: "edit", defaultMessage: "Edit" }),
      "modify.config": intl.formatMessage({
        id: "modify.config",
        defaultMessage: "Modify Configuration",
      }),
      "attach.in.virtualization.primary.storage": intl.formatMessage({
        id: "attach",
        defaultMessage: "Attach",
      }),
      "detach.in.virtualization.primary.storage": intl.formatMessage({
        id: "detach",
        defaultMessage: "Detach",
      }),
      delete: intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
    },
    host: {
      "create.instance": intl.formatMessage({
        id: "create.instance",
        defaultMessage: "New Virtual Machine",
      }),
      add: intl.formatMessage({ id: "add.host", defaultMessage: "Add Host" }),
      edit: intl.formatMessage({ id: "edit", defaultMessage: "Edit" }),
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
      "edit.config": intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      }),
      "tag.management": intl.formatMessage({
        id: "tag.management",
        defaultMessage: "Tag Management",
      }),
      "enter.web.terminal": intl.formatMessage({
        id: "enter.web.terminal",
        defaultMessage: "Enter Web Terminal",
      }),
      "add.bond": intl.formatMessage({
        id: "add.AggPort",
        defaultMessage: "Add Bond",
      }),
      "attach.tag": intl.formatMessage({ id: "add.tag", defaultMessage: "" }),
      "detach.tag": intl.formatMessage({
        id: "remove.tag",
        defaultMessage: "",
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
      edit: intl.formatMessage({ id: "edit", defaultMessage: "Edit" }),
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
      edit: intl.formatMessage({ id: "edit.name", defaultMessage: "Edit Name" }),
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
      "export.image": intl.formatMessage({
        id: "export.image",
        defaultMessage: "Export Image",
      }),
      "sync.image": intl.formatMessage({
        id: "sync.image",
        defaultMessage: "Synchronize Image",
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
      recover: intl.formatMessage({ id: "recover", defaultMessage: "Recover" }),
      expunge: intl.formatMessage({
        id: "expunge",
        defaultMessage: "Expunge",
      }),
    },
  };

  return {
    customActionConfig,
  };
}

export default getCustomActionAuth;
