jest.mock('@/base/action-service', () => ({
  ActionService: class ActionService {}
}))

jest.mock('./upload/long-job-extend', () => ({
  __esModule: true,
  default: class LongJobExtend {}
}))

import { UpgradeMigrationServiceService } from './upgrade'

describe('UpgradeMigrationServiceService', () => {
  const createService = () => {
    const service = new UpgradeMigrationServiceService()
    const customCall = jest.fn().mockResolvedValue({ actionId: 'action-1' })
    service.longJobExtend = { customCall } as any
    return { customCall, service }
  }

  it('serializes every Normal upgrade field including explicit null values', async () => {
    const { customCall, service } = createService()
    const input = {
      payload: {
        uuid: 'package-1',
        upgradeType: 'Normal',
        name: 'zmigrate-2.tar.gz',
        url: 'https://example.com/zmigrate-2.tar.gz',
        type: 'ZMigrate',
        installPath: '/zmigrate/package/zmigrate-2.tar.gz',
        backupStorageUuid: null,
        hash: null
      },
      action: {
        actionId: 'action-1',
        name: 'Upgrade migration service'
      }
    } as const

    await expect(service.upgradeMigrationService(input as never)).resolves.toEqual({
      actionId: 'action-1'
    })
    expect(customCall).toHaveBeenCalledWith(
      'Upgrade migration service',
      'APIUploadAndExecuteSoftwareUpgradePackageMsg',
      JSON.stringify(input.payload),
      'action-1',
      'https://example.com/zmigrate-2.tar.gz',
      'MigrationService'
    )
  })

  it('serializes every Reexecute upgrade field including explicit null values', async () => {
    const { customCall, service } = createService()
    const input = {
      payload: {
        uuid: 'package-1',
        upgradeType: 'Reexecute',
        name: null,
        url: null,
        type: null,
        installPath: null,
        backupStorageUuid: null,
        hash: null
      },
      action: {
        actionId: 'action-1',
        name: 'Upgrade migration service'
      }
    } as const

    await expect(service.upgradeMigrationService(input as never)).resolves.toEqual({
      actionId: 'action-1'
    })
    expect(customCall).toHaveBeenCalledWith(
      'Upgrade migration service',
      'APIUploadAndExecuteSoftwareUpgradePackageMsg',
      JSON.stringify(input.payload),
      'action-1',
      '',
      'MigrationService'
    )
  })
})
