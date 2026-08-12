import { useIntl } from "react-intl";

/**
 * 这里是xksy的报警翻译
 * 主要是v6之前的
 * v6之后xsky报警结构有变化
 */
function useThirdPartyConfig() {
  const intl = useIntl();

  const resourceTypeToNameConfig = {
    "capacity-available-days": intl.formatMessage({
      id: "capacity.available.days",
      defaultMessage: "Remaining Days to Use Capacity",
    }),
    "clock-diff": intl.formatMessage({
      id: "clock.diff",
      defaultMessage: "Time Out of Sync",
    }),
    "cpu-usage": intl.formatMessage({
      id: "cpu.usage",
      defaultMessage: "CPU Utilization",
    }),
    "capacity-usage": intl.formatMessage({
      id: "capacity.usage",
      defaultMessage: "Storage Utilization",
    }),
    "root-fs-usage": intl.formatMessage({
      id: "root.fs.usage",
      defaultMessage: "System Disk Utilization",
    }),
    "license-expired": intl.formatMessage({
      id: "license.expired",
      defaultMessage: " Expired",
    }),
    "license-expiring": intl.formatMessage({
      id: "license.expiring",
      defaultMessage: "Expiring",
    }),
    "license-invalid": intl.formatMessage({
      id: "license.invalid",
      defaultMessage: "Invalid",
    }),
    "memory-usage": intl.formatMessage({
      id: "memory.usage",
      defaultMessage: " Memory Utilization",
    }),
    "update-rgw-failed": intl.formatMessage({
      id: "update.rgw.failed",
      defaultMessage: "Object Gateway Update Failed",
    }),
    "vips-changed": intl.formatMessage({
      id: "vips.changed",
      defaultMessage: "VIP Change",
    }),
    "smart-warning": intl.formatMessage({
      id: "smart.warning",
      defaultMessage: "S.M.A.R.T. Alarm",
    }),
    "smart-error": intl.formatMessage({
      id: "smart.error",
      defaultMessage: "S.M.A.R.T. Error",
    }),
    "ssd-life-left": intl.formatMessage({
      id: "ssd.life.left",
      defaultMessage: "Remaining Write Endurance",
    }),
    "rx-bandwidth-usage": intl.formatMessage({
      id: "rx.bandwidth.usage",
      defaultMessage: "Receive Bandwidth Usage",
    }),
    "tx-bandwidth-usage": intl.formatMessage({
      id: "tx.bandwidth.usage",
      defaultMessage: "Transmit Bandwidth Usage",
    }),
    "osd-omap-usage": intl.formatMessage({
      id: "osd.omap.usage",
      defaultMessage: "Index Capacity Utilization",
    }),
    "osd-usage": intl.formatMessage({
      id: "osd.usage",
      defaultMessage: "Data Partition Utilization",
    }),
    "password-expired": intl.formatMessage({
      id: "password.expired",
      defaultMessage: "Password has not been updated for a long time",
    }),
    "connection-status": intl.formatMessage({
      id: "connection.status",
      defaultMessage: "Connectivity",
    }),
    breakdown: intl.formatMessage({ id: "breakdown", defaultMessage: "Crush" }),
    critical: intl.formatMessage({ id: "critical", defaultMessage: "Emergent" }),
    error: intl.formatMessage({ id: "error", defaultMessage: "Error" }),
    "hard-quota-exceed": intl.formatMessage({
      id: "hard.quota.exceed",
      defaultMessage: "Capacity Usage Exceeds Hard Quota",
    }),
    "soft-quota-exceed": intl.formatMessage({
      id: "soft.quota.exceed",
      defaultMessage: "Capacity Usage Exceeds Soft Quota",
    }),
    event: intl.formatMessage({ id: "event", defaultMessage: "Event" }),
    eq: intl.formatMessage({ id: "eq", defaultMessage: ", " }),
    gt: intl.formatMessage({ id: "gt", defaultMessage: "Exceed" }),
    lt: intl.formatMessage({ id: "lt", defaultMessage: "Below" }),
    le: intl.formatMessage({ id: "le", defaultMessage: "less than or equal to" }),
    ge: intl.formatMessage({ id: "ge", defaultMessage: "greater than or equal to" }),
    info: intl.formatMessage({ id: "info", defaultMessage: "Message" }),
    offline: intl.formatMessage({ id: "offline", defaultMessage: "Offline" }),
    online: intl.formatMessage({ id: "online", defaultMessage: "Online" }),
    recovery: intl.formatMessage({ id: "recovery", defaultMessage: "Recovery" }),
    degraded: intl.formatMessage({ id: "degraded", defaultMessage: "Degrade" }),
    reonline: intl.formatMessage({
      id: "reonline",
      defaultMessage: "Launch Again",
    }),
    warning: intl.formatMessage({ id: "warning", defaultMessage: "Warning" }),
    stopped: intl.formatMessage({ id: "stopped", defaultMessage: "Stopped" }),
    full: intl.formatMessage({ id: "alreadyFull", defaultMessage: "Full" }),
    updated: intl.formatMessage({ id: "updated", defaultMessage: "Updated" }),
    unknown: intl.formatMessage({
      id: "disconnected",
      defaultMessage: "Disconnected",
    }),
    "osd-omap-backfillfull": intl.formatMessage({
      id: "osd.omap.backfillfull",
      defaultMessage: "85%",
    }),
    "osd-unable-to-reach": intl.formatMessage({
      id: "osd.unable.to.reach",
      defaultMessage: "OSD Unreachable",
    }),
    "osd-omap-nearfull": intl.formatMessage({
      id: "osd.omap.nearfull",
      defaultMessage: "70%",
    }),
    "osd-omap-full": intl.formatMessage({
      id: "osd.omap.full",
      defaultMessage: "Write to Threshold",
    }),
    "osd-backfillfull": intl.formatMessage({
      id: "osd.backfillfull",
      defaultMessage: "85%",
    }),
    "osd-nearfull": intl.formatMessage({
      id: "osd.nearfull",
      defaultMessage: "80%",
    }),
    "osd-full": intl.formatMessage({
      id: "osd.full",
      defaultMessage: "Write to Threshold",
    }),
    "network-latency": intl.formatMessage({
      id: "network.latency",
      defaultMessage: "Latency",
    }),
    "network-address": intl.formatMessage({
      id: "network.address",
      defaultMessage: "Network Address",
    }),
    "network-loss": intl.formatMessage({
      id: "network.loss",
      defaultMessage: "Packet Loss",
    }),
    "network-bandwidth": intl.formatMessage({
      id: "network.bandwidth",
      defaultMessage: "Bandwidth",
    }),
    "dp-block-backup-fail": intl.formatMessage({
      id: "dp.block.backup.fail",
      defaultMessage: "Snapshot Backup Failed",
    }),
    "dp-block-backup-skip": intl.formatMessage({
      id: "dp.block.backup.skip",
      defaultMessage: "Skip Snapshot Backup",
    }),
    "dp-block-backup-recover-fail": intl.formatMessage({
      id: "dp.block.backup.recover.fail",
      defaultMessage: "Resource Recovery Failed",
    }),
    "dp-block-backup-conflict-bucket": intl.formatMessage({
      id: "dp.block.backup.conflict.bucket",
      defaultMessage: "Snapshot backup failed: there are conflicts in remote buckets of platforms in multiple policies.",
    }),
    "dp-block-snapshot-fail": intl.formatMessage({
      id: "dp.block.snapshot.fail",
      defaultMessage: "Scheduled Snapshot Failed",
    }),
    "dp-block-snapshot-skip": intl.formatMessage({
      id: "dp.block.snapshot.skip",
      defaultMessage: "Skip Scheduled Snapshot",
    }),
    "dp-fs-snapshot-create-fail": intl.formatMessage({
      id: "dp.fs.snapshot.create.fail",
      defaultMessage: "Failed to Create Scheduled Snapshot",
    }),
    "dp-fs-snapshot-create-skip": intl.formatMessage({
      id: "dp.fs.snapshot.create.skip",
      defaultMessage: "Scheduled Snapshot Not Created",
    }),
    "disk-latency": intl.formatMessage({
      id: "disk.latency",
      defaultMessage: "I/O Latency",
    }),
    "pool-io-latency": intl.formatMessage({
      id: "pool.io.latency",
      defaultMessage: "I/O Latency",
    }),
    "osd-not-connected": intl.formatMessage({
      id: "osd.not.connected",
      defaultMessage: "Connectivity",
    }),
    "open-file": intl.formatMessage({
      id: "open.file",
      defaultMessage: "Opened Files",
    }),
    "block-volume-migration-failure": intl.formatMessage({
      id: "block.volume.migration.failure",
      defaultMessage: "Online Migration Failed",
    }),
    "access-logging": intl.formatMessage({
      id: "access.logging",
      defaultMessage: "Access Logs",
    }),
    "log-delivery-unauthorized": intl.formatMessage({
      id: "log.delivery.unauthorized",
      defaultMessage: "Log transfer group has no permissions.",
    }),
    "logging-owner-unauthorized": intl.formatMessage({
      id: "logging.owner.unauthorized",
      defaultMessage: "Log file owner has no permissions.",
    }),
    "log-delay-2-hours": intl.formatMessage({
      id: "log.delay.2.hours",
      defaultMessage: "No writes for more than 2 hours",
    }),
    "log-delay-12-hours": intl.formatMessage({
      id: "log.delay.12.hours",
      defaultMessage: "No writes for more than 12 hours",
    }),
    "quota-num-usage": intl.formatMessage({
      id: "quota.num.usage",
      defaultMessage: "Object Quota Utilization",
    }),
    "local-quota-num-usage": intl.formatMessage({
      id: "local.quota.num.usage",
      defaultMessage: "Storage Object Quota Utilization of This Cluster",
    }),
    "external-quota-num-usage": intl.formatMessage({
      id: "external.quota.num.usage",
      defaultMessage: "Storage Object Quota Utilization of Secondary Cluster",
    }),
    "quota-size-usage": intl.formatMessage({
      id: "quota.size.usage",
      defaultMessage: "Capacity Quota Utilization",
    }),
    "local-quota-size-usage": intl.formatMessage({
      id: "local.quota.size.usage",
      defaultMessage: "Storage Capacity Quota Utilization of This Cluster",
    }),
    "external-quota-size-usage": intl.formatMessage({
      id: "external.quota.size.usage",
      defaultMessage: "Secondary Storage Capacity Quota Utilization",
    }),
    "mon-in-quorum": intl.formatMessage({
      id: "mon.in.quorum",
      defaultMessage: "mon-in-quorum",
    }),
    "mon-out-of-quorum": intl.formatMessage({
      id: "mon.out.of.quorum",
      defaultMessage: "mon-out-of-quorum",
    }),
    "specification-num": intl.formatMessage({
      id: "specification.num",
      defaultMessage: "Objects",
    }),
    "host-network-subhealth": intl.formatMessage({
      id: "host.network.subhealth",
      defaultMessage: "Network Semi-health",
    }),
    "osd-disk-subhealth": intl.formatMessage({
      id: "osd.disk.subhealth",
      defaultMessage: "OSD Semi-health",
    }),
    "osd-crc-check": intl.formatMessage({
      id: "osd.crc.check",
      defaultMessage: "Data Verification",
    }),
    "misconfigured-local-port-range-min": intl.formatMessage({
      id: "misconfigured.local.port.range.min",
      defaultMessage: "The minimum value of local source port is too small.",
    }),
    "dp-block-async-replication-skip": intl.formatMessage({
      id: "dp.block.async.replication.skip",
      defaultMessage: "Skip Snapshot Replica",
    }),
    "dp-block-async-replication-fail": intl.formatMessage({
      id: "dp.block.async.replication.fail",
      defaultMessage: "Snapshot Replica Failed",
    }),
    "dp-block-async-replication-connect": intl.formatMessage({
      id: "dp.block.async.replication.connect",
      defaultMessage: "Snapshot Replica Link Restored",
    }),
    "dp-block-async-replication-disconnect": intl.formatMessage({
      id: "dp.block.async.replication.disconnect",
      defaultMessage: "Snapshot Replica Link Disconnected",
    }),
    "dp-volume-group-snapshot-replication-fail": intl.formatMessage({
      id: "dp.volume.group.snapshot.replication.fail",
      defaultMessage: "Snapshot Replica Failed",
    }),
    "dp-volume-group-snapshot-replication-skip": intl.formatMessage({
      id: "dp.volume.group.snapshot.replication.skip",
      defaultMessage: "Skip Snapshot Replica",
    }),
    "dp-volume-group-snapshot-replication-connect": intl.formatMessage({
      id: "dp.volume.group.snapshot.replication.connect",
      defaultMessage: "Snapshot Replica Link Restored",
    }),
    "dp-volume-group-snapshot-replication-disconnect": intl.formatMessage({
      id: "dp.volume.group.snapshot.replication.disconnect",
      defaultMessage: "Snapshot Replica Link Disconnected",
    }),
    "db-standby-server-left-cluster": intl.formatMessage({
      id: "db-standby-server-left-cluster",
      defaultMessage: "Backup Database Offline",
    }),
    "root-disk-ioutil": intl.formatMessage({
      id: "root.disk.ioutil",
      defaultMessage: "System Disk IO Utilization",
    }),
    "packet-loss": intl.formatMessage({
      id: "packet.loss",
      defaultMessage: "NIC Lost Packets",
    }),
    "packet-err": intl.formatMessage({
      id: "packet.err",
      defaultMessage: "NIC Error Packets",
    }),
    "cpu-usage-recovery": intl.formatMessage({
      id: "cpu.usage.recovery",
      defaultMessage: "CPU Utilization Recovery",
    }),
    "memory-usage-recovery": intl.formatMessage({
      id: "memory.usage.recovery",
      defaultMessage: "Memory Usage Recovery",
    }),
    "packet-loss-ratio": intl.formatMessage({
      id: "packet-loss-ratio",
      defaultMessage: "Packet Loss Rate",
    }),
    "disk-ioutil-recovery": intl.formatMessage({
      id: "disk.ioutil.recovery",
      defaultMessage: "System Disk I/O Utilization Recovered",
    }),
    "fs-gateway-group-vip-switched": intl.formatMessage({
      id: "fs.gateway.group.vip.switched",
      defaultMessage: "File Gateway VIP Switch",
    }),
    "pause-sync-doc": intl.formatMessage({
      id: "pause.sync.doc",
      defaultMessage: "Pause search data synchronization.",
    }),
    "time-jumped": intl.formatMessage({
      id: "time.jumped",
      defaultMessage: "Server Time Change",
    }),
    "os-external-storage-platform-connect": intl.formatMessage({
      id: "os.external.storage.platform.connect",
      defaultMessage: "Link Recovery",
    }),
    "os-external-storage-platform-disconnect": intl.formatMessage({
      id: "os.external.storage.platform.disconnect",
      defaultMessage: "Link Disconnected",
    }),
    "external-xsubhealth-network_interface": intl.formatMessage({
      id: "external.xsubhealth.network.interface",
      defaultMessage: "Node Network Abnormal",
    }),
    "network-address-network-subhealth-v2-recovery": intl.formatMessage({
      id: "external.xsubhealth.network.status.recovery",
      defaultMessage: "Node Network Abnormal Recovered",
    }),
    "network-address-network-subhealth-v2": intl.formatMessage({
      id: "external.xsubhealth.network.status",
      defaultMessage: "Node Network Abnormal",
    }),
    "network-subhealth": intl.formatMessage({
      id: "external.xsubhealth.network.status",
      defaultMessage: "Node Network Abnormal",
    }),
    accessToken: intl.formatMessage({
      id: "accessToken",
      defaultMessage: "Access Token",
    }),
    authSecurityPolicy: intl.formatMessage({
      id: "authSecurityPolicy",
      defaultMessage: "Management Security Policy",
    }),
    actionLog: intl.formatMessage({
      id: "actionLog",
      defaultMessage: "Event Center",
    }),
    eventLog: intl.formatMessage({
      id: "eventLog",
      defaultMessage: "System Event",
    }),
    alert: intl.formatMessage({ id: "alert", defaultMessage: "Alarm Records" }),
    allResource: intl.formatMessage({
      id: "allResource",
      defaultMessage: "All Resources",
    }),
    alertGroup: intl.formatMessage({
      id: "alertGroup",
      defaultMessage: "Alarm Notification",
    }),
    alertRule: intl.formatMessage({
      id: "alertRule",
      defaultMessage: "Alarm Rules",
    }),
    cache: intl.formatMessage({ id: "cache", defaultMessage: "Cache Disk" }),
    client: intl.formatMessage({ id: "client", defaultMessage: "Client" }),
    clientCode: intl.formatMessage({
      id: "clientCode",
      defaultMessage: "Client Encoding",
    }),
    clientLunMapping: intl.formatMessage({
      id: "clientLunMapping",
      defaultMessage: "Client LUN Mapping",
    }),
    cloudDatacenter: intl.formatMessage({
      id: "cloudDatacenter",
      defaultMessage: "Cloud Center",
    }),
    cluster: intl.formatMessage({
      id: "local.cluster",
      defaultMessage: "Local Cluster",
    }),
    clusterService: intl.formatMessage({
      id: "clusterService",
      defaultMessage: "Cluster Service",
    }),
    conf: intl.formatMessage({ id: "conf", defaultMessage: "Configuration" }),
    dpBlockSnapshotRecoveryJob: intl.formatMessage({
      id: "dpBlockSnapshotRecoveryJob",
      defaultMessage: "Resource Recovery",
    }),
    email: intl.formatMessage({
      id: "email.mailbox",
      defaultMessage: "Email Address",
    }),
    emailConfig: intl.formatMessage({
      id: "emailConfig",
      defaultMessage: "Email Settings",
    }),
    emailGroup: intl.formatMessage({
      id: "emailGroup",
      defaultMessage: "Notification List",
    }),
    fsActiveDirectory: intl.formatMessage({
      id: "fsActiveDirectory",
      defaultMessage: "AD",
    }),
    fsAdUser: intl.formatMessage({ id: "fsAdUser", defaultMessage: "AD User" }),
    fsAdUserGroup: intl.formatMessage({
      id: "fsAdUserGroup",
      defaultMessage: "AD User Group",
    }),
    fsArbitrationPool: intl.formatMessage({
      id: "fsArbitrationPool",
      defaultMessage: "Arbitration Pool",
    }),
    fsClient: intl.formatMessage({
      id: "fsClient",
      defaultMessage: "File Client",
    }),
    fsClientGroup: intl.formatMessage({
      id: "fsClientGroup",
      defaultMessage: "File Client Group",
    }),
    fsFtpShareAcl: intl.formatMessage({
      id: "fsFtpShareAcl",
      defaultMessage: "Access Control List with FTP Share",
    }),
    fsGateway: intl.formatMessage({
      id: "fsGateway",
      defaultMessage: "File Gateway",
    }),
    fsGatewayGroup: intl.formatMessage({
      id: "fsGatewayGroup",
      defaultMessage: "File Gateway Group",
    }),
    fsUserGroup: intl.formatMessage({
      id: "fsUserGroup",
      defaultMessage: "Local User Group",
    }),
    fsLdap: intl.formatMessage({ id: "fsLdap", defaultMessage: "LDAP" }),
    fsLdapUser: intl.formatMessage({
      id: "fsLdapUser",
      defaultMessage: "LDAP User",
    }),
    fsLdapUserGroup: intl.formatMessage({
      id: "fsLdapUserGroup",
      defaultMessage: "LDAP User Group",
    }),
    fsNfsShareAcl: intl.formatMessage({
      id: "fsNfsShareAcl",
      defaultMessage: "Access Control List with NFS Share",
    }),
    fsShareMapping: intl.formatMessage({
      id: "fsShareMapping",
      defaultMessage: "File Share Mapping",
    }),
    fsSmbShareAcl: intl.formatMessage({
      id: "fsSmbShareAcl",
      defaultMessage: "Access Control List with SMB/CIFS/FTP Share",
    }),
    networkDiagnosis: intl.formatMessage({
      id: "networkDiagnosis",
      defaultMessage: "Network Diagnosis",
    }),
    networkDiagnosisItem: intl.formatMessage({
      id: "networkDiagnosisItem",
      defaultMessage: "Network Diagnosis Server",
    }),
    hostInitialization: intl.formatMessage({
      id: "hostInitialization",
      defaultMessage: "Server Initialization",
    }),
    hostValidator: intl.formatMessage({
      id: "hostValidator",
      defaultMessage: "Server Check",
    }),
    identityPlatform: intl.formatMessage({
      id: "identityPlatform",
      defaultMessage: "Authentication",
    }),
    license: intl.formatMessage({ id: "license", defaultMessage: "Licenses" }),
    lun: intl.formatMessage({ id: "lun", defaultMessage: "LUN" }),
    mappingGroup: intl.formatMessage({
      id: "mappingGroup",
      defaultMessage: "Mapping Group",
    }),
    networkAddress: intl.formatMessage({
      id: "networkAddress",
      defaultMessage: "Network Address",
    }),
    networkAddressLink: intl.formatMessage({
      id: "networkAddressLink",
      defaultMessage: "Network Link",
    }),
    networkInterface: intl.formatMessage({
      id: "networkInterface",
      defaultMessage: "NIC",
    }),
    nfsGatewayBucketMap: intl.formatMessage({
      id: "nfsGatewayBucketMap",
      defaultMessage: "Map NFS Gateway",
    }),
    objectStorage: intl.formatMessage({
      id: "objectStorage",
      defaultMessage: "Object Storage",
    }),
    osKey: intl.formatMessage({
      id: "osKey",
      defaultMessage: "Object User Key Pair",
    }),
    osBucketKey: intl.formatMessage({
      id: "osBucketKey",
      defaultMessage: "Bucket Access Key",
    }),
    osBucketNfsClient: intl.formatMessage({
      id: "osBucketNfsClient",
      defaultMessage: "Bucket NFS Client",
    }),
    osCustomLabel: intl.formatMessage({
      id: "osCustomLabel",
      defaultMessage: "Query Field",
    }),
    osdGroup: intl.formatMessage({
      id: "osdGroup",
      defaultMessage: "Associated Pool Group",
    }),
    osExternalStoragePlatform: intl.formatMessage({
      id: "osExternalStoragePlatform",
      defaultMessage: "Storage Platform",
    }),
    osStorageClass: intl.formatMessage({
      id: "osStorageClass",
      defaultMessage: "Storage Class",
    }),
    osZone: intl.formatMessage({ id: "osZone", defaultMessage: "Site" }),
    osZonePeriod: intl.formatMessage({
      id: "osZonePeriod",
      defaultMessage: "Valid Period of Namespace",
    }),
    osZoneTranslog: intl.formatMessage({
      id: "osZoneTranslog",
      defaultMessage: "Namespace Log",
    }),
    osObject: intl.formatMessage({
      id: "osObject",
      defaultMessage: "Object Query",
    }),
    osSearchEngine: intl.formatMessage({
      id: "osSearchEngine",
      defaultMessage: "Query Engine",
    }),
    osSearchEs: intl.formatMessage({
      id: "osSearchEs",
      defaultMessage: "ES Query",
    }),
    osSearchGateway: intl.formatMessage({
      id: "osSearchGateway",
      defaultMessage: "Query Gateway",
    }),
    osRemotePolicy: intl.formatMessage({
      id: "osRemotePolicy",
      defaultMessage: "Object Routing Policy",
    }),
    osReplicationPath: intl.formatMessage({
      id: "osReplicationPath",
      defaultMessage: "Sync Path",
    }),
    osReplicationZone: intl.formatMessage({
      id: "osReplicationZone",
      defaultMessage: "Sync Site",
    }),
    partition: intl.formatMessage({ id: "partition", defaultMessage: "Partition" }),
    protectionDomain: intl.formatMessage({
      id: "protectionDomain",
      defaultMessage: "Data Protection Domain",
    }),
    placementNode: intl.formatMessage({
      id: "placementNode",
      defaultMessage: "Topology Node",
    }),
    remoteCluster: intl.formatMessage({
      id: "remoteCluster",
      defaultMessage: "Remote Cluster",
    }),
    roleMapping: intl.formatMessage({
      id: "roleMapping",
      defaultMessage: "Mapping Role",
    }),
    service: intl.formatMessage({ id: "service", defaultMessage: "Service" }),
    snmp: intl.formatMessage({ id: "snmp", defaultMessage: "SNMP" }),
    stretchedCluster: intl.formatMessage({
      id: "stretchedCluster",
      defaultMessage: "Stretched Cluster",
    }),
    sslCertificate: intl.formatMessage({
      id: "sslCertificate",
      defaultMessage: "SSL Certificate",
    }),
    systemLog: intl.formatMessage({
      id: "systemLog",
      defaultMessage: "System Log",
    }),
    systemPool: intl.formatMessage({
      id: "systemPool",
      defaultMessage: "Object Storage System Resources Pool",
    }),
    target: intl.formatMessage({ id: "target", defaultMessage: "Gateway Server" }),
    topology: intl.formatMessage({
      id: "topology",
      defaultMessage: "Topology Management",
    }),
    topologyNetwork: intl.formatMessage({
      id: "topologyNetwork",
      defaultMessage: "Topology Management",
    }),
    user: intl.formatMessage({ id: "user", defaultMessage: "User" }),
    vip: intl.formatMessage({ id: "vip", defaultMessage: "VIP" }),
    vipGroup: intl.formatMessage({
      id: "vipGroup",
      defaultMessage: "VIP Group",
    }),
    vipInstance: intl.formatMessage({
      id: "vipInstance",
      defaultMessage: "VIP in Effect",
    }),
    virtualMachine: intl.formatMessage({
      id: "virtualMachine",
      defaultMessage: "VM",
    }),
    vmDisk: intl.formatMessage({ id: "vmDisk", defaultMessage: "VM Disks" }),
    vmImage: intl.formatMessage({ id: "vmImage", defaultMessage: "VM Image" }),
    trash: intl.formatMessage({ id: "trash", defaultMessage: "Recycle Bin" }),
    trashResource: intl.formatMessage({
      id: "trashResource",
      defaultMessage: "Recycle Bin Resources",
    }),
    domainUserValidator: intl.formatMessage({
      id: "domainUserValidator",
      defaultMessage: "Domain User Authentication",
    }),
    osExternalStorageClass: intl.formatMessage({
      id: "osExternalStorageClass",
      defaultMessage: "Secondary Storage",
    }),
    allValue: intl.formatMessage({
      id: "allValue",
      defaultMessage: "All Resources",
    }),
    accessPath: intl.formatMessage({
      id: "accessPath",
      defaultMessage: "Access Path",
    }),
    blockVolumeGroup: intl.formatMessage({
      id: "blockVolumeGroup",
      defaultMessage: "Consistency Group",
    }),
    blockVolumeGroupSnapshot: intl.formatMessage({
      id: "blockVolumeGroupSnapshot",
      defaultMessage: "Consistency Group Snapshot",
    }),
    blockVolumeMigrationJob: intl.formatMessage({
      id: "blockVolumeMigrationJob",
      defaultMessage: "Migration Task",
    }),
    disk: intl.formatMessage({ id: "physical.disk", defaultMessage: "Physical Disk" }),
    clientGroup: intl.formatMessage({
      id: "clientGroup",
      defaultMessage: "Client Group",
    }),
    cloudInstance: intl.formatMessage({
      id: "cloudInstance",
      defaultMessage: "Virtual Machine",
    }),
    cloudPlatform: intl.formatMessage({
      id: "cloudPlatform",
      defaultMessage: "platform Platform",
    }),
    cloudVolume: intl.formatMessage({
      id: "cloudVolume",
      defaultMessage: "Mounted Disk",
    }),
    cryptoKey: intl.formatMessage({
      id: "cryptoKey",
      defaultMessage: "Key Management",
    }),
    fsUser: intl.formatMessage({ id: "fsUser", defaultMessage: "Local User" }),
    fsFolder: intl.formatMessage({
      id: "fsFolder",
      defaultMessage: "File System",
    }),
    fsQuotaTree: intl.formatMessage({
      id: "fsQuotaTree",
      defaultMessage: "Quota Tree",
    }),
    fsSnapshot: intl.formatMessage({
      id: "fsSnapshot",
      defaultMessage: "File Snapshot",
    }),
    fsSmbShare: intl.formatMessage({
      id: "fsSmbShare",
      defaultMessage: "SMB/CIFS Share",
    }),
    fsNfsShare: intl.formatMessage({
      id: "fsNfsShare",
      defaultMessage: "NFS Share",
    }),
    fsFtpShare: intl.formatMessage({
      id: "fsFtpShare",
      defaultMessage: "FTP Share",
    }),
    host: intl.formatMessage({ id: "server", defaultMessage: "Server" }),
    nfsGateway: intl.formatMessage({
      id: "nfsGateway",
      defaultMessage: "NFS Gateway",
    }),
    osBucket: intl.formatMessage({ id: "osBucket", defaultMessage: "Bucket" }),
    osGateway: intl.formatMessage({
      id: "osGateway",
      defaultMessage: "S3 Gateway",
    }),
    osPolicy: intl.formatMessage({
      id: "osPolicy",
      defaultMessage: "Storage Policy",
    }),
    osUser: intl.formatMessage({ id: "osUser", defaultMessage: "Object User" }),
    osd: intl.formatMessage({ id: "osd", defaultMessage: "Disk" }),
    pool: intl.formatMessage({ id: "pool", defaultMessage: "Storage Pool" }),
    dpGateway: intl.formatMessage({
      id: "dpGateway",
      defaultMessage: "Protection Gateway",
    }),
    protectionPlan: intl.formatMessage({
      id: "protectionPlan",
      defaultMessage: "Protection Plan",
    }),
    dpBlockSnapshotPolicy: intl.formatMessage({
      id: "dpBlockSnapshotPolicy",
      defaultMessage: "Volume Scheduled Snapshot Policy",
    }),
    dpBlockBackupPolicy: intl.formatMessage({
      id: "dpBlockBackupPolicy",
      defaultMessage: "Volume Snapshot Backup Policy",
    }),
    dpBlockAsyncReplicationPolicy: intl.formatMessage({
      id: "dpBlockAsyncReplicationPolicy",
      defaultMessage: "Volume Snapshot Replica Policy",
    }),
    dpBlockSnapshotPlan: intl.formatMessage({
      id: "dpBlockSnapshotPlan",
      defaultMessage: "Volume Snapshot Protection Plan",
    }),
    dpFsSnapshotPolicy: intl.formatMessage({
      id: "dpFsSnapshotPolicy",
      defaultMessage: "Scheduled File Snapshot Policy",
    }),
    s3LoadBalancerGroup: intl.formatMessage({
      id: "s3LoadBalancerGroup",
      defaultMessage: "Object Routing",
    }),
    s3LoadBalancer: intl.formatMessage({
      id: "s3LoadBalancer",
      defaultMessage: "Load Balancer",
    }),
    blockSnapshot: intl.formatMessage({
      id: "blockSnapshot",
      defaultMessage: "Volume Snapshot",
    }),
    blockVolume: intl.formatMessage({
      id: "blockVolume",
      defaultMessage: "Volume",
    }),
    dpSite: intl.formatMessage({
      id: "dpSite",
      defaultMessage: "Snapshot Backup Platform",
    }),
    dpAsyncReplicationSite: intl.formatMessage({
      id: "dpAsyncReplicationSite",
      defaultMessage: "Snapshot Replica Platform",
    }),
    dpSyncReplicationSite: intl.formatMessage({
      id: "dpSyncReplicationSite",
      defaultMessage: "Sync Replica Platform",
    }),
    dpBlockReplicationPolicy: intl.formatMessage({
      id: "dpBlockReplicationPolicy",
      defaultMessage: "Volume Sync Replica Policy",
    }),
    dpVolumeGroupSnapshotReplicationPolicy: intl.formatMessage({
      id: "dpVolumeGroupSnapshotReplicationPolicy",
      defaultMessage: "Group Snapshot Replica Policy",
    }),
    dpBlockBackupJob: intl.formatMessage({
      id: "dpBlockBackupJob",
      defaultMessage: "Volume Snapshot Backup Task",
    }),
    dpBlockSnapshotJob: intl.formatMessage({
      id: "dpBlockSnapshotJob",
      defaultMessage: "Volume Scheduled Snapshot Task",
    }),
    dpFsSnapshotJob: intl.formatMessage({
      id: "dpFsSnapshotJob",
      defaultMessage: "File Scheduled Snapshot Task",
    }),
    dpBlockAsyncReplicationPair: intl.formatMessage({
      id: "dpBlockAsyncReplicationPair",
      defaultMessage: "Volume Replica Relationship",
    }),
    dpVolumeGroupSnapshotReplicationPair: intl.formatMessage({
      id: "dpVolumeGroupSnapshotReplicationPair",
      defaultMessage: "Consistency Group Replica Relationship",
    }),
    dpBlockAsyncReplicationJob: intl.formatMessage({
      id: "dpBlockAsyncReplicationJob",
      defaultMessage: "Volume Snapshot Replica Task",
    }),
    dpVolumeGroupSnapshotReplicationJob: intl.formatMessage({
      id: "dpVolumeGroupSnapshotReplicationJob",
      defaultMessage: "Group Snapshot Replica Task",
    }),
    network_interface: intl.formatMessage({
      id: "network_interface",
      defaultMessage: "NIC",
    }),
  } as any;

  const translateName = (resourceType: string) =>
    resourceTypeToNameConfig[resourceType];

  const translateDependency = (key?: any, dependency?: string) => {
    if (dependency) {
      if (dependency.includes("days"))
        return intl.formatMessage({ id: "day", defaultMessage: "days" });
      if (
        dependency.includes("usage") ||
        dependency.includes("packet-loss-ratio")
      )
        return `${key! * 100}%`;
      if (dependency.includes("clock-diff")) return `${key}ms`;
      if (dependency.includes("osd-unable-to-reach")) return translateName(key);
    }
    return "";
  };

  return {
    translateName,
    translateDependency,
  };
}

export default useThirdPartyConfig;
