jest.mock('@/utils', () => ({
  execCommand: jest.fn()
}))

jest.mock('@/api/zstack/GetVersionAction', () => ({
  GetVersionAction: class GetVersionAction {}
}))

import { LicenseService } from './license.service'

describe('LicenseService about license queries', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    LicenseService.clearAboutLicenseInfoCache()
    LicenseService.clearVersionByZStackCTLCache()
  })

  it('loads only primary license data in getAboutLicenseInfo', async () => {
    const service = new LicenseService()
    const getLicenseInfoAction = { call: jest.fn() }
    const getZMigrateGatewayVmInstancesAction = { call: jest.fn() }
    const isOpensourceVersionAction = { call: jest.fn() }
    const managementNodeService = { getDoubleManagementNodeInfo: jest.fn() }

    Object.assign(service, {
      getLicenseInfoAction,
      getVersionAction: {
        call: jest.fn().mockResolvedValue({ version: '5.0.0' })
      },
      getZMigrateGatewayVmInstancesAction,
      isOpensourceVersionAction,
      managementNodeService
    })
    jest.spyOn(service, 'getVersionByZStackCTL').mockResolvedValue('5.0.0.1')

    const result = await service.getAboutLicenseInfo()

    expect(getLicenseInfoAction.call).not.toHaveBeenCalled()
    expect(getZMigrateGatewayVmInstancesAction.call).not.toHaveBeenCalled()
    expect(isOpensourceVersionAction.call).not.toHaveBeenCalled()
    expect(managementNodeService.getDoubleManagementNodeInfo).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      licenseType: 'Community',
      uuid: 'opensource-community-license',
      version: '5.0.0',
      versionOnUI: '5.0.0.1',
      additions: [],
      usage: {
        quota: 10000,
        used: 0
      }
    })
  })

  it('deduplicates concurrent getAboutLicenseInfo calls', async () => {
    const service = new LicenseService()
    const getLicenseInfoAction = { call: jest.fn() }

    Object.assign(service, {
      getLicenseInfoAction,
      getVersionAction: {
        call: jest.fn().mockResolvedValue({ version: '5.0.0' })
      }
    })
    jest.spyOn(service, 'getVersionByZStackCTL').mockResolvedValue('5.0.0.1')

    const [first, second] = await Promise.all([
      service.getAboutLicenseInfo(),
      service.getAboutLicenseInfo()
    ])

    expect(first).toBe(second)
    expect(getLicenseInfoAction.call).not.toHaveBeenCalled()
    expect(service.getVersionAction.call).toHaveBeenCalledTimes(1)
  })
})
