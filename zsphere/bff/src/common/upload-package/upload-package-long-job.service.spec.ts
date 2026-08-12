jest.mock('@/api/zstack/base/zql-query', () => ({
  ZQLService: class ZQLService {}
}))

jest.mock('@/api/zstack/QueryLongJobAction', () => ({
  QueryLongJobAction: class QueryLongJobAction {}
}))

jest.mock('@/common/long-job/long-job.service', () => ({
  LongJobService: class LongJobService {}
}))

jest.mock('@/common/pub-sub/pub-sub.service', () => ({
  PubSubService: class PubSubService {}
}))

jest.mock('@/common/zql/index', () => ({
  __esModule: true,
  default: { stringify: jest.fn(() => 'query') },
  ZOp: { like: 'like' }
}))

import { UploadPackageLongJobService } from './upload-package-long-job.service'

class TestUploadPackageLongJobService extends UploadPackageLongJobService {
  protected get cronJobName(): string {
    return 'testUploadPackageInterval'
  }

  getPollingName(longJobUuid: string) {
    return this.getCronJobName(longJobUuid)
  }

  resolveDefaultTarget(jobResult: Record<string, unknown>) {
    return this.resolveSoftwarePackageUploadTarget(jobResult)
  }
}

describe('UploadPackageLongJobService.interval', () => {
  const createService = (inventory: Record<string, unknown>) => {
    const stop = jest.fn()
    const service = new TestUploadPackageLongJobService()
    service.sessionId = 'session-1'
    service.queryLongJobAction = {
      call: jest.fn().mockResolvedValue({ inventories: [inventory] })
    } as any
    service.schedulerRegistry = {
      deleteCronJob: jest.fn(),
      getCronJob: jest.fn(() => ({ stop }))
    } as any
    service.zqlService = {
      call: jest.fn().mockResolvedValue({
        results: [{ inventories: [{ tag: 'uploadUrl::http://example.com/package-upload' }] }]
      })
    } as any
    return { service, stop }
  }

  it('keeps polling until the upload target is ready', async () => {
    const { service, stop } = createService({
      jobResult: JSON.stringify({ uploadTaskUuid: 'upload-task-1' }),
      state: 'Running',
      uuid: 'long-job-1'
    })
    const resolve = jest.fn()
    const reject = jest.fn()

    await service.interval(
      'api-id-1',
      'testUploadPackageInterval:api-id-1',
      resolve,
      reject,
      result =>
        result.uploadTaskUuid && result.uploadUrl
          ? {
              artifactUuid: String(result.uploadTaskUuid),
              uploadUrl: String(result.uploadUrl)
            }
          : undefined
    )

    expect(resolve).not.toHaveBeenCalled()
    expect(reject).not.toHaveBeenCalled()
    expect(stop).not.toHaveBeenCalled()
  })

  it('keeps polling while the long job is waiting', async () => {
    const { service, stop } = createService({ state: 'Waiting', uuid: 'long-job-1' })
    const resolve = jest.fn()
    const reject = jest.fn()

    await service.interval(
      'api-id-1',
      'testUploadPackageInterval:api-id-1',
      resolve,
      reject,
      () => undefined
    )

    expect(resolve).not.toHaveBeenCalled()
    expect(reject).not.toHaveBeenCalled()
    expect(stop).not.toHaveBeenCalled()
  })

  it('resolves and stops polling after the upload target becomes ready', async () => {
    const { service, stop } = createService({
      jobResult: JSON.stringify({
        uploadTaskUuid: 'upload-task-1',
        uploadUrl: 'http://example.com/vddk-upload'
      }),
      state: 'Running',
      uuid: 'long-job-1'
    })
    const resolve = jest.fn()
    const reject = jest.fn()

    await service.interval(
      'api-id-1',
      'testUploadPackageInterval:api-id-1',
      resolve,
      reject,
      result =>
        result.uploadTaskUuid && result.uploadUrl
          ? {
              artifactUuid: String(result.uploadTaskUuid),
              uploadUrl: String(result.uploadUrl)
            }
          : undefined
    )

    expect(JSON.parse(resolve.mock.calls[0][0])).toEqual({
      artifactUuid: 'upload-task-1',
      realUuid: 'long-job-1',
      uploadUrl: 'http://example.com/vddk-upload'
    })
    expect(reject).not.toHaveBeenCalled()
    expect(stop).toHaveBeenCalledTimes(1)
    expect(service.schedulerRegistry.deleteCronJob).toHaveBeenCalledWith(
      'testUploadPackageInterval:api-id-1'
    )
  })

  it('rejects and stops polling when a terminal job has no upload target', async () => {
    const { service, stop } = createService({ state: 'Failed', uuid: 'long-job-1' })
    const reject = jest.fn()

    await service.interval(
      'api-id-1',
      'testUploadPackageInterval:api-id-1',
      jest.fn(),
      reject,
      () => undefined
    )

    expect(reject).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Upload package long job finished before the upload target was ready: Failed'
      })
    )
    expect(stop).toHaveBeenCalledTimes(1)
  })

  it('rejects and stops polling when the target resolver throws', async () => {
    const { service, stop } = createService({
      jobResult: JSON.stringify({ uploadTaskUuid: 'upload-task-1' }),
      state: 'Running',
      uuid: 'long-job-1'
    })
    const reject = jest.fn()

    await service.interval(
      'api-id-1',
      'testUploadPackageInterval:api-id-1',
      jest.fn(),
      reject,
      () => {
        throw new Error('invalid upload target')
      }
    )

    expect(reject).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'invalid upload target' })
    )
    expect(stop).toHaveBeenCalledTimes(1)
  })

  it('uses a unique cron name for each long job', () => {
    const { service } = createService({})

    expect(service.getPollingName('api-id-1')).toBe('testUploadPackageInterval:api-id-1')
    expect(service.getPollingName('api-id-2')).toBe('testUploadPackageInterval:api-id-2')
  })

  it('resolves the default software package target from its upload tag', async () => {
    const { service } = createService({})

    await expect(
      service.resolveDefaultTarget({ inventory: { uuid: 'package-1' } })
    ).resolves.toEqual({
      artifactUuid: 'package-1',
      uploadUrl: 'http://example.com/package-upload'
    })
  })
})
