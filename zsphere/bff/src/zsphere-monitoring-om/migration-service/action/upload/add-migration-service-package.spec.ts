jest.mock('@/base/action-service', () => ({
  ActionService: class ActionService {}
}))

jest.mock('./long-job-extend', () => ({
  __esModule: true,
  default: class LongJobExtend {}
}))

import { AddMigrationServicePackageService } from './add-migration-service-package'

describe('AddMigrationServicePackageService', () => {
  const createService = () => {
    const service = new AddMigrationServicePackageService()
    const customCall = jest.fn().mockResolvedValue({ actionId: 'action-1' })
    service.longJobExtend = { customCall } as any
    return { customCall, service }
  }

  it('forwards every URL package field to the migration upload long job', async () => {
    const { customCall, service } = createService()
    const input = {
      payload: {
        name: 'zmigrate.tar.gz',
        url: 'https://example.com/zmigrate.tar.gz',
        installPath: '/zmigrate/package/zmigrate.tar.gz',
        type: 'ZMigrate',
        backupStorageUuid: 'backup-storage-1'
      },
      action: {
        actionId: 'action-1',
        name: 'Upload migration package'
      }
    } as const

    await expect(service.addMigrationServicePackage(input as never)).resolves.toEqual({
      actionId: 'action-1'
    })
    expect(customCall).toHaveBeenCalledWith(
      'Upload migration package',
      'APIUploadSoftwarePackageToBackupStorageMsg',
      JSON.stringify(input.payload),
      'action-1',
      input.payload.url,
      'MigrationService'
    )
  })

  it('forwards every upload URL package field to the migration upload long job', async () => {
    const { customCall, service } = createService()
    const input = {
      payload: {
        name: 'zmigrate.tar.gz',
        url: 'upload://zmigrate.tar.gz',
        installPath: '/zmigrate/package/zmigrate.tar.gz',
        type: 'ZMigrate',
        backupStorageUuid: 'backup-storage-1',
        hash: 'sha256:package-hash'
      },
      action: {
        actionId: 'action-1',
        name: 'Upload migration package'
      }
    } as const

    await expect(service.addMigrationServicePackage(input as never)).resolves.toEqual({
      actionId: 'action-1'
    })
    expect(customCall).toHaveBeenCalledWith(
      'Upload migration package',
      'APIUploadSoftwarePackageToBackupStorageMsg',
      JSON.stringify(input.payload),
      'action-1',
      input.payload.url,
      'MigrationService'
    )
  })
})
