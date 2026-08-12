import LongJobExtend from './long-job-extend'

jest.mock('cron', () => ({
  CronJob: jest.fn().mockImplementation((_expression, handler) => ({
    start: jest.fn(handler),
    stop: jest.fn()
  }))
}))

const createService = ({
  submitResult,
  submitError,
  recordResult
}: {
  submitResult?: unknown
  submitError?: unknown
  recordResult?: Promise<unknown>
}) => {
  const publish = jest.fn().mockResolvedValue(undefined)
  const response = jest.fn()
  const recordActionFailed = jest.fn().mockResolvedValue(undefined)
  const recordTaskFailed = jest.fn().mockResolvedValue(undefined)
  const record = jest.fn().mockReturnValue(recordResult ?? Promise.resolve(undefined))
  const submitLongJob = submitError
    ? jest.fn().mockRejectedValue(submitError)
    : jest.fn().mockResolvedValue(submitResult)
  const addCronJob = jest.fn()
  const service = new LongJobExtend()

  Object.assign(service as any, {
    _context: { req: { headers: { 'x-session-id': 'session-1' } } },
    logger: { error: jest.fn() },
    pubSubService: {
      get: jest.fn(() => ({ publish })),
      response
    },
    record,
    schedulerRegistry: { addCronJob },
    recordActionService: {
      recordActionFailed,
      recordActionStart: jest.fn().mockResolvedValue(undefined),
      recordTaskFailed,
      recordTaskStart: jest.fn().mockResolvedValue(undefined)
    },
    submitLongJobAction: {
      call: submitLongJob
    }
  })

  return {
    addCronJob,
    publish,
    record,
    recordActionFailed,
    recordTaskFailed,
    response,
    service,
    submitLongJob
  }
}

const callUrlUpload = (service: LongJobExtend) =>
  service.customCall(
    'Upload migration package',
    'APIUploadSoftwarePackageToBackupStorageMsg',
    JSON.stringify({ url: 'https://example.com/zmigrate.tar.gz' }),
    'action-1',
    'https://example.com/zmigrate.tar.gz',
    'MigrationService'
  )

describe('migration LongJobExtend.customCall', () => {
  it('propagates the original submission error after publishing the failure', async () => {
    const submitError = new Error('submit failed')
    const { publish, recordActionFailed, recordTaskFailed, response, service } = createService({
      submitError
    })

    await expect(callUrlUpload(service)).rejects.toBe(submitError)

    expect(recordActionFailed).toHaveBeenCalledWith('action-1')
    expect(recordTaskFailed).toHaveBeenCalledWith('action-1')
    expect(publish).toHaveBeenCalledWith(
      'session-1',
      expect.objectContaining({
        listenActionResp: expect.objectContaining({ actionId: 'action-1', state: 'fail' })
      })
    )
    expect(response).not.toHaveBeenCalled()
  })

  it('uses a safe payload when the original error cannot be serialized', async () => {
    const submitError = new Error('submit failed')
    ;(submitError as any).self = submitError
    const { publish, service } = createService({ submitError })

    try {
      await expect(callUrlUpload(service)).rejects.toBe(submitError)
    } finally {
      delete (submitError as any).self
    }

    expect(publish).toHaveBeenCalledWith('session-1', {
      listenActionResp: {
        actionId: 'action-1',
        error: '{"message":"Unable to serialize migration LongJob error"}',
        sessionId: 'session-1',
        state: 'fail'
      }
    })
  })

  it('uses the safe payload when JSON serialization returns undefined', async () => {
    const submitError = Symbol('submit failed')
    const { publish, service } = createService({ submitError })

    await expect(callUrlUpload(service)).rejects.toBe(submitError)
    expect(publish).toHaveBeenCalledWith('session-1', {
      listenActionResp: {
        actionId: 'action-1',
        error: '{"message":"Unable to serialize migration LongJob error"}',
        sessionId: 'session-1',
        state: 'fail'
      }
    })
  })

  it('preserves the local upload polling and custom target resolver flow', async () => {
    const { addCronJob, record, service, submitLongJob } = createService({
      submitResult: { inventory: { apiId: 'api-1', uuid: 'long-job-1' } }
    })
    const resolveUploadTarget = jest.fn()
    const interval = jest.fn((_longJobUuid, _cronJobName, resolve) => {
      resolve(
        JSON.stringify({
          artifactUuid: 'upload-task-1',
          realUuid: 'long-job-1',
          uploadUrl: 'http://example.com/upload'
        })
      )
    })
    Object.assign(service, { interval })

    await expect(
      service.customCall(
        'Upload VDDK package',
        'APIUploadSoftwarePackageToVmMsg',
        JSON.stringify({ hash: 'hash-1', url: 'upload://vddk.tar.gz' }),
        'action-1',
        'upload://vddk.tar.gz',
        'MigrationService',
        resolveUploadTarget
      )
    ).resolves.toEqual({
      actionId: 'action-1',
      jobResult: JSON.stringify({
        artifactUuid: 'upload-task-1',
        realUuid: 'long-job-1',
        uploadUrl: 'http://example.com/upload'
      }),
      transit: `${process.env.HOST}:${process.env.BASE_PORT}`
    })

    expect(submitLongJob).toHaveBeenCalledWith(
      {
        jobData: JSON.stringify({ hash: 'hash-1', url: 'upload://vddk.tar.gz' }),
        jobName: 'APIUploadSoftwarePackageToVmMsg',
        systemTags: ['uploadSoftwarePackage::hash-1']
      },
      { actionId: 'action-1', taskId: 'action-1' }
    )
    expect(addCronJob).toHaveBeenCalledWith('migrationPackageInterval:api-1', expect.anything())
    expect(interval).toHaveBeenCalledWith(
      'api-1',
      'migrationPackageInterval:api-1',
      expect.any(Function),
      expect.any(Function),
      resolveUploadTarget
    )
    expect(record).toHaveBeenCalledWith(
      'APIUploadSoftwarePackageToVmMsg',
      JSON.stringify({ hash: 'hash-1', url: 'upload://vddk.tar.gz' }),
      'action-1',
      'long-job-1',
      'MigrationService'
    )
  })

  it('awaits migration long-job persistence and propagates its failure', async () => {
    const recordError = new Error('record failed')
    const recordResult = Promise.reject(recordError)
    void recordResult.catch(() => undefined)
    const { record, service } = createService({
      recordResult,
      submitResult: { inventory: { apiId: 'api-1', uuid: 'long-job-1' } }
    })

    await expect(callUrlUpload(service)).rejects.toBe(recordError)
    expect(record).toHaveBeenCalledWith(
      'APIUploadSoftwarePackageToBackupStorageMsg',
      JSON.stringify({ url: 'https://example.com/zmigrate.tar.gz' }),
      'action-1',
      'long-job-1',
      'MigrationService'
    )
  })
})
