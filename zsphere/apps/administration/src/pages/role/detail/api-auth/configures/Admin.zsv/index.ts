import AccesskeyAPI from './AccesskeyAPI'
import AccountAPI from './AccountAPI'
import AffintityGroupAPI from './AffintityGroupAPI'
import BackupStorageAPI from './BackupStorageAPI'
import ConsoleAPI from './ConsoleAPI'
import GloableConigAPI from './GloableConigAPI'
import HAstrategyAPI from './HAstrategyAPI'
import HostAPI from './HostAPI'
import ImageAPI from './ImageAPI'
import L3NetworkAPI from './L3NetworkAPI'
import LiceneAPI from './LiceneAPI'
import ManagementNodeAPI from './ManagementNodeAPI'
import PrimaryStorageAPI from './PrimaryStorageAPI'
import SchedulerAPI from './SchedulerAPI'
import SecurityGroupAPI from './SecurityGroupAPI'
import TagAPI from './TagAPI'
import VmInstanceAPI from './VmInstanceAPI'
import VolumeBackupAPI from './VolumeBackupAPI'
import ZoneAPI from './ZoneAPI'
import ZwatchAPI from './ZwatchAPI'

const useStruct = (intl: any) => {
  return [
    {
      key: 'resInventoryAuth',
      name: intl.formatMessage({ id: 'roleApiModule.resInventoryAuth', defaultMessage: 'Inventory API Permissions' }),
      children: [
        {
          key: 'BackupStorage',
          api: BackupStorageAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.BackupStorage', defaultMessage: 'Image Storage APIs' })
        },
        {
          key: 'Host',
          api: HostAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.Host', defaultMessage: 'Host APIs' })
        },
        {
          key: 'Image',
          api: ImageAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.Image', defaultMessage: 'Image and Template APIs' })
        },
        {
          key: 'L3Network',
          api: L3NetworkAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.L3Network', defaultMessage: 'Network Resource APIs' })
        },
        {
          key: 'PrimaryStorage',
          api: PrimaryStorageAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.PrimaryStorage', defaultMessage: 'Data Storage APIs' })
        },
        {
          key: 'Scheduler',
          api: SchedulerAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.Scheduler', defaultMessage: 'Scheduler APIs' })
        },
        {
          key: 'SecurityGroup',
          api: SecurityGroupAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.SecurityGroup', defaultMessage: 'Security Group APIs' })
        },
        {
          key: 'VmInstance',
          api: VmInstanceAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.VmInstance', defaultMessage: 'Virtual Machine APIs' })
        },
        {
          key: 'Zone',
          api: ZoneAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.Zone', defaultMessage: 'Data Center and Cluster APIs' })
        },
      ]
    },
    {
      key: 'bizReliability',
      name: intl.formatMessage({ id: 'roleApiModule.bizReliability', defaultMessage: 'Business Reliability API Permissions' }),
      children: [
        {
          key: 'AffintityGroup',
          api: AffintityGroupAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.AffintityGroup', defaultMessage: 'VM Scheduling Policy APIs' })
        },
        {
          key: 'HAstrategy',
          api: HAstrategyAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.HAstrategy', defaultMessage: 'HA Policy APIs' })
        },
      ]
    },
    {
      key: 'dataProtection',
      name: intl.formatMessage({ id: 'roleApiModule.dataProtection', defaultMessage: 'Data Protection API Permissions' }),
      children: [
        {
          key: 'VolumeBackup',
          api: VolumeBackupAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.VolumeBackup', defaultMessage: 'Virtual Machine Backup APIs' })
        },
      ]
    },
    {
      key: 'opsManagement',
      name: intl.formatMessage({ id: 'roleApiModule.opsManagement', defaultMessage: 'O&M Management' }),
      children: [
        {
          key: 'Tag',
          api: TagAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.Tag', defaultMessage: 'Tag APIs' })
        },
        {
          key: 'Zwatch',
          api: ZwatchAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.Zwatch', defaultMessage: 'Alarm Service APIs' })
        },
      ]
    },
    {
      key: 'sysAdminAuth',
      name: intl.formatMessage({ id: 'roleApiModule.sysAdminAuth', defaultMessage: 'System Management API Permissions' }),
      children: [
        {
          key: 'Accesskey',
          api: AccesskeyAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.Accesskey', defaultMessage: 'AccessKey APIs' })
        },
        {
          key: 'Account',
          api: AccountAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.Account', defaultMessage: 'User Management APIs' })
        },
        {
          key: 'Console',
          api: ConsoleAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.Console', defaultMessage: 'Console Proxy APIs' })
        },
        {
          key: 'GloableConig',
          api: GloableConigAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.GloableConig', defaultMessage: 'System Parameter APIs' })
        },
        {
          key: 'Licene',
          api: LiceneAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.Licene', defaultMessage: 'License APIs' })
        },
        {
          key: 'ManagementNode',
          api: ManagementNodeAPI(intl),
          name: intl.formatMessage({ id: 'roleApiModule.ManagementNode', defaultMessage: 'Management Node APIs' })
        },
      ]
    },
  ]
}

export default {
  AccesskeyAPI,
  AccountAPI,
  AffintityGroupAPI,
  BackupStorageAPI,
  ConsoleAPI,
  GloableConigAPI,
  HAstrategyAPI,
  HostAPI,
  ImageAPI,
  L3NetworkAPI,
  LiceneAPI,
  ManagementNodeAPI,
  PrimaryStorageAPI,
  SchedulerAPI,
  SecurityGroupAPI,
  TagAPI,
  VmInstanceAPI,
  VolumeBackupAPI,
  ZoneAPI,
  ZwatchAPI,
  useStruct
}