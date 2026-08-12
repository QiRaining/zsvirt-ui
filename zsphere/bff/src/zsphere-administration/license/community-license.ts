import { UIExtendedLicenseType } from '@/common/enum'

import type { LicenseInfoExtensionResp, LicenseInfoResp } from './license.model'

const COMMUNITY_LICENSE_QUOTA = 10000
const COMMUNITY_LICENSE_UUID = 'opensource-community-license'
const COMMUNITY_LICENSE_ISSUED_DATE = '1970-01-01 00:00:00'
const COMMUNITY_LICENSE_EXPIRED_DATE = '2999-12-31 23:59:59'
const COMMUNITY_PROD_INFO = 'ZStack' as LicenseInfoResp['prodInfo']
const COMMUNITY_LICENSE_QUOTA_TYPE = 'Host' as NonNullable<
  LicenseInfoResp['usage']
>['quotaType']

export function createOpenSourceCommunityLicenseInfo({
  version,
  versionOnUI
}: {
  version?: string
  versionOnUI?: string
} = {}): LicenseInfoResp {
  return {
    uuid: COMMUNITY_LICENSE_UUID,
    licenseType: UIExtendedLicenseType.Community,
    prodInfo: COMMUNITY_PROD_INFO,
    licenseRequest: '',
    expiredDate: COMMUNITY_LICENSE_EXPIRED_DATE,
    issuedDate: COMMUNITY_LICENSE_ISSUED_DATE,
    user: 'Community',
    hostNum: COMMUNITY_LICENSE_QUOTA,
    availableHostNum: COMMUNITY_LICENSE_QUOTA,
    cpuNum: COMMUNITY_LICENSE_QUOTA,
    availableCpuNum: COMMUNITY_LICENSE_QUOTA,
    vmNum: COMMUNITY_LICENSE_QUOTA,
    availableVmNum: COMMUNITY_LICENSE_QUOTA,
    expired: false,
    version,
    versionOnUI,
    additions: [],
    usage: {
      available: COMMUNITY_LICENSE_QUOTA,
      quota: COMMUNITY_LICENSE_QUOTA,
      quotaType: COMMUNITY_LICENSE_QUOTA_TYPE,
      used: 0
    },
    opensource: true,
    hostNameList: [],
    isDualManagementNode: false,
    dualManagementNodeInfo: {
      licenses: [],
      addOns: []
    },
    statusList: []
  }
}

export function createOpenSourceLicenseExtensionInfo(): LicenseInfoExtensionResp {
  return {
    opensource: true,
    hostNameList: [],
    isDualManagementNode: false,
    dualManagementNodeInfo: {
      licenses: [],
      addOns: []
    },
    statusList: [],
    additions: []
  }
}
