import { UploadOffsetResolverService } from './upload-offset-resolver.service'

describe('UploadOffsetResolverService', () => {
  it('normalizes image upload job details from zstack image-store', async () => {
    const zsHttpService = {
      get: jest.fn().mockResolvedValue({
        data: {
          existingJobDetails: [
            {
              longJobUuid: 'job-1',
              offset: '2048',
              imageUploadUrl: 'http://example.com/image-upload',
              imageUuid: 'image-1'
            }
          ]
        }
      })
    }
    const resolver = new UploadOffsetResolverService(zsHttpService as any, {} as any)

    const result = await resolver.resolve({
      uploadType: 'image',
      hash: 'hash-1',
      longJobUuid: 'job-1'
    })

    expect(zsHttpService.get).toHaveBeenCalledWith('/images/upload-job/details/hash-1')
    expect(result).toEqual({
      longJobUuid: 'job-1',
      offset: 2048,
      uploadUrl: 'http://example.com/image-upload',
      artifactUuid: 'image-1'
    })
  })

  it('normalizes software package upload job details from zstack', async () => {
    const getUploadSoftwarePackageJobDetailsAction = {
      call: jest.fn().mockResolvedValue({
        existingJobDetails: [
          {
            longJobUuid: 'job-2',
            offset: 4096,
            softwarePackageUploadUrl: 'http://example.com/package-upload',
            softwarePackageUuid: 'package-1'
          }
        ]
      })
    }
    const resolver = new UploadOffsetResolverService(
      {} as any,
      getUploadSoftwarePackageJobDetailsAction as any
    )

    const result = await resolver.resolve({
      uploadType: 'storagePackage',
      hash: 'hash-2',
      longJobUuid: 'job-2'
    })

    expect(getUploadSoftwarePackageJobDetailsAction.call).toHaveBeenCalledWith({
      softwarePackageId: 'hash-2'
    })
    expect(result).toEqual({
      longJobUuid: 'job-2',
      offset: 4096,
      uploadUrl: 'http://example.com/package-upload',
      artifactUuid: 'package-1'
    })
  })

  it('uses the software package details action for migration service packages', async () => {
    const getUploadSoftwarePackageJobDetailsAction = {
      call: jest.fn().mockResolvedValue({
        existingJobDetails: [
          {
            longJobUuid: 'job-3',
            offset: '6144',
            softwarePackageUploadUrl: 'http://example.com/migration-package-upload',
            softwarePackageUuid: 'migration-package-1'
          }
        ]
      })
    }
    const resolver = new UploadOffsetResolverService(
      {} as any,
      getUploadSoftwarePackageJobDetailsAction as any
    )

    const result = await resolver.resolve({
      uploadType: 'migrationServicePackage',
      hash: 'hash-3',
      longJobUuid: 'job-3'
    })

    expect(getUploadSoftwarePackageJobDetailsAction.call).toHaveBeenCalledWith({
      softwarePackageId: 'hash-3'
    })
    expect(result).toEqual({
      longJobUuid: 'job-3',
      offset: 6144,
      uploadUrl: 'http://example.com/migration-package-upload',
      artifactUuid: 'migration-package-1'
    })
  })
})
