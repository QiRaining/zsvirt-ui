import { UploadSessionService } from './upload-session.service'

describe('UploadSessionService', () => {
  const createRow = (data: Record<string, unknown>) => ({
    ...data,
    get: () => data
  })

  const createMutableRow = (data: Record<string, unknown>) => {
    const row = {
      ...data,
      update: jest.fn(async update => {
        Object.assign(data, update)
        Object.assign(row, update)
        return row
      }),
      get: () => data
    }
    return row
  }

  const createService = ({
    uploadSessionModel,
    zsSessionModel = {},
    zsLongJobModel = {},
    uploadOffsetResolver,
    uploadJobRetryService
  }: {
    uploadSessionModel: unknown
    zsSessionModel?: unknown
    zsLongJobModel?: unknown
    uploadOffsetResolver?: unknown
    uploadJobRetryService?: unknown
  }) => {
    const service = new UploadSessionService()

    Object.assign(service as any, {
      uploadSessionModel,
      zsSessionModel,
      zsLongJobModel,
      uploadOffsetResolver,
      uploadJobRetryService
    })

    return service
  }

  it('keeps the cron provider constructor-free so Nest Scheduler can register jobs', () => {
    expect(UploadSessionService.length).toBe(0)
  })

  it('registers a resumable upload session for the current user', async () => {
    const uploadSessionModel = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn(async data => createRow(data))
    }
    const zsSessionModel = {
      findOne: jest.fn().mockResolvedValue({
        userId: 'user-1',
        accountId: 'account-1'
      })
    }
    const service = createService({ uploadSessionModel, zsSessionModel, zsLongJobModel: {} })

    const session = await service.register('session-1', {
      uploadType: 'image',
      hash: 'hash-1',
      fileName: 'image.qcow2',
      fileSize: 1024,
      lastModified: 123,
      longJobUuid: 'job-1',
      artifactUuid: 'image-1',
      uploadUrl: 'upload://image',
      offset: 256
    })

    expect(uploadSessionModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: 'session-1',
        userUuid: 'user-1',
        accountUuid: 'account-1',
        uploadType: 'image',
        hash: 'hash-1',
        fileName: 'image.qcow2',
        fileSize: 1024,
        lastModified: 123,
        longJobUuid: 'job-1',
        artifactUuid: 'image-1',
        uploadUrl: 'upload://image',
        offset: 256,
        status: 'UPLOADING'
      })
    )
    expect(session.resumable).toBe(true)
  })

  it('scopes long job session reuse to the current owner', async () => {
    const uploadSessionModel = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn(async data => createRow(data))
    }
    const zsSessionModel = {
      findOne: jest.fn().mockResolvedValue({
        userId: 'user-1',
        accountId: 'account-1'
      })
    }
    const service = createService({ uploadSessionModel, zsSessionModel, zsLongJobModel: {} })

    await service.register('session-1', {
      uploadType: 'image',
      hash: 'hash-1',
      longJobUuid: 'job-1'
    })

    expect(uploadSessionModel.findOne).toHaveBeenCalledWith({
      where: {
        longJobUuid: 'job-1',
        userUuid: 'user-1',
        accountUuid: 'account-1'
      }
    })
  })

  it('lists nonterminal sessions for the current user', async () => {
    const uploadSessionModel = {
      findAll: jest.fn().mockResolvedValue([
        createRow({
          uploadType: 'storagePackage',
          hash: 'hash-2',
          fileName: 'zstone.bin',
          fileSize: 2048,
          longJobUuid: 'job-2',
          artifactUuid: 'pkg-1',
          uploadUrl: 'upload://package',
          offset: 1024,
          status: 'WAITING_FOR_FILE',
          expiresAt: new Date(Date.now() + 1000)
        })
      ])
    }
    const zsSessionModel = {
      findOne: jest.fn().mockResolvedValue({
        userId: 'user-1',
        accountId: 'account-1'
      })
    }
    const service = createService({
      uploadSessionModel,
      zsSessionModel,
      zsLongJobModel: { findAll: jest.fn().mockResolvedValue([]) }
    })

    const sessions = await service.listResumable('session-1')

    expect(uploadSessionModel.findAll).toHaveBeenCalled()
    expect(sessions).toEqual([
      expect.objectContaining({
        uploadType: 'storagePackage',
        hash: 'hash-2',
        longJobUuid: 'job-2',
        status: 'WAITING_FOR_FILE',
        resumable: true
      })
    ])
  })

  it('scopes resumable session lookup to an empty session when session id is missing', async () => {
    const uploadSessionModel = {
      findAll: jest.fn().mockResolvedValue([])
    }
    const zsSessionModel = {
      findOne: jest.fn()
    }
    const service = createService({
      uploadSessionModel,
      zsSessionModel,
      zsLongJobModel: { findAll: jest.fn().mockResolvedValue([]) }
    })

    await service.listResumable(undefined as unknown as string)

    expect(zsSessionModel.findOne).not.toHaveBeenCalled()
    expect(uploadSessionModel.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          sessionId: ''
        })
      })
    )
  })

  it('syncs terminal canceled long jobs before returning resumable sessions', async () => {
    const canceledSession = createMutableRow({
      uploadType: 'image',
      hash: 'hash-canceled',
      fileName: 'canceled.raw',
      longJobUuid: 'job-canceled',
      offset: 1024,
      status: 'UPLOADING',
      expiresAt: new Date(Date.now() + 1000)
    })
    const runningSession = createMutableRow({
      uploadType: 'image',
      hash: 'hash-running',
      fileName: 'running.raw',
      longJobUuid: 'job-running',
      offset: 2048,
      status: 'WAITING_FOR_FILE',
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findAll: jest.fn().mockResolvedValue([canceledSession, runningSession])
    }
    const zsSessionModel = {
      findOne: jest.fn().mockResolvedValue({
        userId: 'user-1',
        accountId: 'account-1'
      })
    }
    const zsLongJobModel = {
      findAll: jest
        .fn()
        .mockResolvedValue([
          createRow({ longJobUuid: 'job-canceled', state: 'CANCELED' }),
          createRow({ longJobUuid: 'job-running', state: 'RUNNING' })
        ])
    }
    const service = createService({ uploadSessionModel, zsSessionModel, zsLongJobModel })

    const sessions = await service.listResumable('session-1')

    expect(zsLongJobModel.findAll).toHaveBeenCalled()
    expect(canceledSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'CANCELED',
        errorReason: expect.stringContaining('Long job'),
        lastOpDate: expect.any(Date)
      })
    )
    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toEqual(
      expect.objectContaining({
        longJobUuid: 'job-running',
        status: 'WAITING_FOR_FILE'
      })
    )
  })

  it('moves failed upload jobs into file availability check before retrying', async () => {
    const failedSession = createMutableRow({
      sessionId: 'session-1',
      userUuid: 'user-1',
      accountUuid: 'account-1',
      uploadType: 'image',
      hash: 'hash-failed',
      fileName: 'failed.raw',
      longJobUuid: 'job-failed',
      offset: 1024,
      status: 'UPLOADING',
      retryCount: 0,
      maxRetryCount: 5,
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findAll: jest.fn().mockResolvedValue([failedSession])
    }
    const zsSessionModel = {
      findOne: jest.fn().mockResolvedValue({
        userId: 'user-1',
        accountId: 'account-1'
      })
    }
    const zsLongJobModel = {
      findAll: jest.fn().mockResolvedValue([
        createRow({
          longJobUuid: 'job-failed',
          state: 'FAILED',
          jobName: 'APIAddImageMsg',
          data: { name: 'failed', url: 'upload://failed', hash: 'hash-failed' },
          resourceType: 'Image',
          clientJobUuid: 'action-1'
        })
      ])
    }
    const service = createService({ uploadSessionModel, zsSessionModel, zsLongJobModel })

    const sessions = await service.listResumable('session-1')

    expect(failedSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'WAITING_FOR_FILE_CHECK',
        retryStatus: 'WAITING_FOR_FILE_CHECK',
        retryCount: 0,
        maxRetryCount: 5,
        nextRetryAt: null,
        fileAvailable: false,
        fileAvailableUntil: null,
        jobName: 'APIAddImageMsg',
        resourceType: 'Image',
        errorReason: expect.stringContaining('Long job')
      })
    )
    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toEqual(
      expect.objectContaining({
        longJobUuid: 'job-failed',
        status: 'WAITING_FOR_FILE_CHECK',
        retryStatus: 'WAITING_FOR_FILE_CHECK',
        resumable: true
      })
    )
  })

  it('keeps retry waiting sessions scheduled when their original long job is still failed', async () => {
    const nextRetryAt = new Date(Date.now() + 5 * 60 * 1000)
    const retrySession = createMutableRow({
      sessionId: 'session-1',
      userUuid: 'user-1',
      accountUuid: 'account-1',
      uploadType: 'image',
      hash: 'hash-failed',
      fileName: 'failed.raw',
      longJobUuid: 'job-failed',
      offset: 1024,
      status: 'RETRY_WAITING',
      retryStatus: 'RETRY_WAITING',
      retryCount: 1,
      maxRetryCount: 5,
      fileAvailable: true,
      fileAvailableUntil: new Date(Date.now() + 60 * 1000),
      nextRetryAt,
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findAll: jest.fn().mockResolvedValue([retrySession])
    }
    const zsSessionModel = {
      findOne: jest.fn().mockResolvedValue({
        userId: 'user-1',
        accountId: 'account-1'
      })
    }
    const zsLongJobModel = {
      findAll: jest.fn().mockResolvedValue([
        createRow({
          longJobUuid: 'job-failed',
          state: 'FAILED',
          jobName: 'APIAddImageMsg',
          data: { name: 'failed', url: 'upload://failed', hash: 'hash-failed' },
          resourceType: 'Image'
        })
      ])
    }
    const service = createService({ uploadSessionModel, zsSessionModel, zsLongJobModel })

    const sessions = await service.listResumable('session-1')

    expect(retrySession.update).not.toHaveBeenCalled()
    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toEqual(
      expect.objectContaining({
        longJobUuid: 'job-failed',
        status: 'RETRY_WAITING',
        retryStatus: 'RETRY_WAITING',
        nextRetryAt,
        retryCount: 1
      })
    )
  })

  it('schedules retry for failed jobs that were waiting for file but still have fresh file availability', async () => {
    const fileAvailableUntil = new Date(Date.now() + 60 * 1000)
    const failedSession = createMutableRow({
      sessionId: 'session-1',
      userUuid: 'user-1',
      accountUuid: 'account-1',
      uploadType: 'image',
      hash: 'hash-failed',
      fileName: 'failed.raw',
      longJobUuid: 'job-failed',
      offset: 1024,
      status: 'WAITING_FOR_FILE',
      retryStatus: 'WAITING_FOR_FILE',
      retryCount: 0,
      maxRetryCount: 5,
      fileAvailable: true,
      fileAvailableUntil,
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findAll: jest.fn().mockResolvedValue([failedSession])
    }
    const zsSessionModel = {
      findOne: jest.fn().mockResolvedValue({
        userId: 'user-1',
        accountId: 'account-1'
      })
    }
    const zsLongJobModel = {
      findAll: jest.fn().mockResolvedValue([
        createRow({
          longJobUuid: 'job-failed',
          state: 'FAILED',
          jobName: 'APIAddImageMsg',
          data: { name: 'failed', url: 'upload://failed', hash: 'hash-failed' },
          resourceType: 'Image'
        })
      ])
    }
    const service = createService({ uploadSessionModel, zsSessionModel, zsLongJobModel })

    const sessions = await service.listResumable('session-1')

    expect(failedSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'RETRY_WAITING',
        retryStatus: 'RETRY_WAITING',
        fileAvailable: true,
        fileAvailableUntil: expect.any(Date),
        nextRetryAt: expect.any(Date),
        jobName: 'APIAddImageMsg',
        resourceType: 'Image',
        errorReason: expect.stringContaining('FAILED')
      })
    )
    const retryPayload = failedSession.update.mock.calls[0][0]
    expect(retryPayload.fileAvailableUntil.getTime()).toBeGreaterThan(
      retryPayload.nextRetryAt.getTime()
    )
    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toEqual(
      expect.objectContaining({
        longJobUuid: 'job-failed',
        status: 'RETRY_WAITING',
        retryStatus: 'RETRY_WAITING',
        resumable: true
      })
    )
  })

  it('marks backend-suspended uploading jobs as waiting for the existing job to continue', async () => {
    const suspendedSession = createMutableRow({
      uploadType: 'image',
      hash: 'hash-suspended',
      fileName: 'suspended.raw',
      longJobUuid: 'job-suspended',
      offset: 1024,
      status: 'UPLOADING',
      retryCount: 0,
      maxRetryCount: 5,
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findAll: jest.fn().mockResolvedValue([suspendedSession])
    }
    const zsSessionModel = {
      findOne: jest.fn().mockResolvedValue({
        userId: 'user-1',
        accountId: 'account-1'
      })
    }
    const zsLongJobModel = {
      findAll: jest.fn().mockResolvedValue([
        createRow({
          longJobUuid: 'job-suspended',
          state: 'SUSPENDED',
          jobName: 'APIAddImageMsg',
          data: { name: 'suspended', url: 'upload://suspended', hash: 'hash-suspended' },
          resourceType: 'Image'
        })
      ])
    }
    const service = createService({ uploadSessionModel, zsSessionModel, zsLongJobModel })

    const sessions = await service.listResumable('session-1')

    expect(suspendedSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'WAITING_FOR_FILE',
        retryStatus: 'WAITING_FOR_FILE',
        lastOpDate: expect.any(Date)
      })
    )
    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toEqual(
      expect.objectContaining({
        longJobUuid: 'job-suspended',
        status: 'WAITING_FOR_FILE',
        retryStatus: 'WAITING_FOR_FILE',
        resumable: true
      })
    )
  })

  it('does not schedule a replacement job when a backend-suspended upload still has fresh file availability', async () => {
    const fileAvailableUntil = new Date(Date.now() + 60 * 1000)
    const suspendedSession = createMutableRow({
      uploadType: 'image',
      hash: 'hash-suspended',
      fileName: 'suspended.raw',
      longJobUuid: 'job-suspended',
      offset: 1024,
      status: 'UPLOADING',
      retryCount: 0,
      maxRetryCount: 5,
      fileAvailable: true,
      fileAvailableUntil,
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findAll: jest.fn().mockResolvedValue([suspendedSession])
    }
    const zsSessionModel = {
      findOne: jest.fn().mockResolvedValue({
        userId: 'user-1',
        accountId: 'account-1'
      })
    }
    const zsLongJobModel = {
      findAll: jest.fn().mockResolvedValue([
        createRow({
          longJobUuid: 'job-suspended',
          state: 'SUSPENDED',
          jobName: 'APIAddImageMsg',
          data: { name: 'suspended', url: 'upload://suspended', hash: 'hash-suspended' },
          resourceType: 'Image'
        })
      ])
    }
    const service = createService({ uploadSessionModel, zsSessionModel, zsLongJobModel })

    const sessions = await service.listResumable('session-1')

    expect(suspendedSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'WAITING_FOR_FILE',
        retryStatus: 'WAITING_FOR_FILE',
        lastOpDate: expect.any(Date)
      })
    )
    const updatePayload = suspendedSession.update.mock.calls[0][0]
    expect(updatePayload.nextRetryAt).toBeUndefined()
    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toEqual(
      expect.objectContaining({
        longJobUuid: 'job-suspended',
        status: 'WAITING_FOR_FILE',
        retryStatus: 'WAITING_FOR_FILE',
        fileAvailable: true,
        fileAvailableUntil,
        resumable: true
      })
    )
  })

  it('keeps manually paused upload sessions when their long job is suspended', async () => {
    const pausedSession = createMutableRow({
      uploadType: 'image',
      hash: 'hash-paused',
      fileName: 'paused.raw',
      longJobUuid: 'job-paused',
      offset: 1024,
      status: 'PAUSED',
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findAll: jest.fn().mockResolvedValue([pausedSession])
    }
    const zsSessionModel = {
      findOne: jest.fn().mockResolvedValue({
        userId: 'user-1',
        accountId: 'account-1'
      })
    }
    const zsLongJobModel = {
      findAll: jest
        .fn()
        .mockResolvedValue([createRow({ longJobUuid: 'job-paused', state: 'SUSPENDED' })])
    }
    const service = createService({ uploadSessionModel, zsSessionModel, zsLongJobModel })

    const sessions = await service.listResumable('session-1')

    expect(pausedSession.update).not.toHaveBeenCalled()
    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toEqual(
      expect.objectContaining({
        longJobUuid: 'job-paused',
        status: 'PAUSED',
        resumable: true
      })
    )
  })

  it('reconciles terminal long jobs in cron sweep', async () => {
    const completedSession = createMutableRow({
      uploadType: 'image',
      hash: 'hash-completed',
      fileName: 'completed.raw',
      longJobUuid: 'job-completed',
      offset: 4096,
      status: 'UPLOADING',
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findAll: jest.fn().mockResolvedValue([completedSession])
    }
    const zsSessionModel = {
      findOne: jest.fn()
    }
    const zsLongJobModel = {
      findAll: jest
        .fn()
        .mockResolvedValue([createRow({ longJobUuid: 'job-completed', state: 'SUCCESS' })])
    }
    const service = createService({ uploadSessionModel, zsSessionModel, zsLongJobModel })

    await service.reconcileTerminalLongJobSessions()

    expect(uploadSessionModel.findAll).toHaveBeenCalled()
    expect(completedSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'COMPLETED',
        lastOpDate: expect.any(Date)
      })
    )
  })

  it('expires resumable sessions that passed their ttl', async () => {
    const uploadSessionModel = {
      update: jest.fn().mockResolvedValue([2])
    }
    const zsSessionModel = {
      findOne: jest.fn()
    }
    const service = createService({ uploadSessionModel, zsSessionModel, zsLongJobModel: {} })

    await service.expireStaleSessions()

    expect(uploadSessionModel.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'EXPIRED'
      }),
      expect.objectContaining({
        where: expect.objectContaining({
          status: expect.any(Object),
          expiresAt: expect.any(Object)
        })
      })
    )
  })

  it('marks stale uploading sessions as waiting for file', async () => {
    const uploadSessionModel = {
      findAll: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue([1])
    }
    const zsSessionModel = {
      findOne: jest.fn()
    }
    const service = createService({ uploadSessionModel, zsSessionModel, zsLongJobModel: {} })

    await service.markStaleUploadingSessions()

    expect(uploadSessionModel.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'WAITING_FOR_FILE'
      }),
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'UPLOADING',
          lastOpDate: expect.any(Object),
          expiresAt: expect.any(Object)
        })
      })
    )
  })

  it('schedules retry when ui reports the file is still available', async () => {
    const row = createMutableRow({
      sessionId: 'session-1',
      userUuid: 'user-1',
      accountUuid: 'account-1',
      uploadType: 'image',
      hash: 'hash-1',
      longJobUuid: 'job-1',
      offset: 1024,
      status: 'WAITING_FOR_FILE_CHECK',
      retryStatus: 'WAITING_FOR_FILE_CHECK',
      retryCount: 0,
      maxRetryCount: 5,
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findOne: jest.fn().mockResolvedValue(row)
    }
    const zsSessionModel = {
      findOne: jest.fn().mockResolvedValue({
        userId: 'user-1',
        accountId: 'account-1'
      })
    }
    const service = createService({ uploadSessionModel, zsSessionModel, zsLongJobModel: {} })

    const result = await service.updateFileAvailability('session-1', 'job-1', {
      fileAvailable: true
    })

    expect(row.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'RETRY_WAITING',
        retryStatus: 'RETRY_WAITING',
        fileAvailable: true,
        fileAvailableUntil: expect.any(Date),
        nextRetryAt: expect.any(Date),
        lastOpDate: expect.any(Date)
      })
    )
    const updatePayload = row.update.mock.calls[0][0]
    expect(updatePayload.nextRetryAt.getTime()).toBeGreaterThan(Date.now() + 2 * 60 * 1000)
    expect(result).toEqual(
      expect.objectContaining({
        status: 'RETRY_WAITING',
        retryStatus: 'RETRY_WAITING',
        fileAvailable: true
      })
    )
  })

  it('refreshes file availability heartbeat without postponing an existing retry schedule', async () => {
    const nextRetryAt = new Date(Date.now() + 60 * 1000)
    const row = createMutableRow({
      sessionId: 'session-1',
      userUuid: 'user-1',
      accountUuid: 'account-1',
      uploadType: 'image',
      hash: 'hash-1',
      longJobUuid: 'job-1',
      status: 'RETRY_WAITING',
      retryStatus: 'RETRY_WAITING',
      retryCount: 0,
      maxRetryCount: 5,
      fileAvailable: true,
      fileAvailableUntil: new Date(Date.now() + 30 * 1000),
      nextRetryAt,
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findOne: jest.fn().mockResolvedValue(row)
    }
    const zsSessionModel = {
      findOne: jest.fn().mockResolvedValue({
        userId: 'user-1',
        accountId: 'account-1'
      })
    }
    const service = createService({ uploadSessionModel, zsSessionModel, zsLongJobModel: {} })

    await service.updateFileAvailability('session-1', 'job-1', {
      fileAvailable: true
    })

    expect(row.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'RETRY_WAITING',
        retryStatus: 'RETRY_WAITING',
        fileAvailable: true,
        fileAvailableUntil: expect.any(Date),
        nextRetryAt,
        lastOpDate: expect.any(Date)
      })
    )
    const updatePayload = row.update.mock.calls[0][0]
    expect(updatePayload.fileAvailableUntil.getTime()).toBeGreaterThan(nextRetryAt.getTime())
  })

  it('refreshes uploading file availability without scheduling a retry', async () => {
    const row = createMutableRow({
      sessionId: 'session-1',
      userUuid: 'user-1',
      accountUuid: 'account-1',
      uploadType: 'image',
      hash: 'hash-1',
      longJobUuid: 'job-1',
      status: 'UPLOADING',
      retryCount: 0,
      maxRetryCount: 5,
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findOne: jest.fn().mockResolvedValue(row)
    }
    const zsSessionModel = {
      findOne: jest.fn().mockResolvedValue({
        userId: 'user-1',
        accountId: 'account-1'
      })
    }
    const service = createService({ uploadSessionModel, zsSessionModel, zsLongJobModel: {} })

    const result = await service.updateFileAvailability('session-1', 'job-1', {
      fileAvailable: true
    })

    const updatePayload = row.update.mock.calls[0][0]
    expect(updatePayload).toEqual(
      expect.objectContaining({
        fileAvailable: true,
        fileAvailableUntil: expect.any(Date),
        lastOpDate: expect.any(Date)
      })
    )
    expect(updatePayload.status).toBeUndefined()
    expect(updatePayload.retryStatus).toBeUndefined()
    expect(updatePayload.nextRetryAt).toBeUndefined()
    expect(result).toEqual(
      expect.objectContaining({
        status: 'UPLOADING',
        fileAvailable: true
      })
    )
  })

  it('stops retrying when ui reports the file is unavailable', async () => {
    const row = createMutableRow({
      sessionId: 'session-1',
      userUuid: 'user-1',
      accountUuid: 'account-1',
      uploadType: 'image',
      hash: 'hash-1',
      longJobUuid: 'job-1',
      status: 'RETRY_WAITING',
      retryStatus: 'RETRY_WAITING',
      retryCount: 1,
      maxRetryCount: 5,
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findOne: jest.fn().mockResolvedValue(row)
    }
    const zsSessionModel = {
      findOne: jest.fn().mockResolvedValue({
        userId: 'user-1',
        accountId: 'account-1'
      })
    }
    const service = createService({ uploadSessionModel, zsSessionModel, zsLongJobModel: {} })

    await service.updateFileAvailability('session-1', 'job-1', {
      fileAvailable: false
    })

    expect(row.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'WAITING_FOR_FILE',
        retryStatus: 'WAITING_FOR_FILE',
        fileAvailable: false,
        fileAvailableUntil: null,
        nextRetryAt: null,
        lastOpDate: expect.any(Date)
      })
    )
  })

  it('recreates due retry sessions and marks them ready for upload', async () => {
    const row = createMutableRow({
      sessionId: 'session-1',
      userUuid: 'user-1',
      accountUuid: 'account-1',
      uploadType: 'image',
      hash: 'hash-1',
      longJobUuid: 'old-job',
      artifactUuid: 'old-image',
      uploadUrl: 'http://example.com/old-upload',
      status: 'RETRY_WAITING',
      retryStatus: 'RETRY_WAITING',
      retryCount: 0,
      maxRetryCount: 5,
      fileAvailable: true,
      fileAvailableUntil: new Date(Date.now() + 60 * 1000),
      nextRetryAt: new Date(Date.now() - 1000),
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findAll: jest.fn().mockResolvedValue([row])
    }
    const zsSessionModel = {
      findOne: jest.fn()
    }
    const retryService = {
      recreateUploadJob: jest.fn().mockResolvedValue({
        longJobUuid: 'new-job',
        artifactUuid: 'new-image',
        uploadUrl: 'http://example.com/new-upload'
      })
    }
    const service = createService({
      uploadSessionModel,
      zsSessionModel,
      zsLongJobModel: {},
      uploadJobRetryService: retryService
    })

    await service.processRetryWaitingSessions()

    expect(uploadSessionModel.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'RETRY_WAITING',
          nextRetryAt: expect.any(Object)
        })
      })
    )
    expect(row.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        status: 'RETRYING',
        retryStatus: 'RETRYING'
      })
    )
    expect(retryService.recreateUploadJob).toHaveBeenCalledWith(
      expect.objectContaining({
        longJobUuid: 'old-job',
        hash: 'hash-1'
      })
    )
    expect(row.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        status: 'RETRY_READY',
        retryStatus: 'RETRY_READY',
        retryCount: 1,
        previousLongJobUuid: 'old-job',
        replacedFromLongJobUuid: 'old-job',
        longJobUuid: 'new-job',
        artifactUuid: 'new-image',
        uploadUrl: 'http://example.com/new-upload',
        offset: 0
      })
    )
  })

  it('skips a due retry session when another cron already claimed it', async () => {
    const row = createMutableRow({
      id: 'row-1',
      sessionId: 'session-1',
      userUuid: 'user-1',
      accountUuid: 'account-1',
      uploadType: 'image',
      hash: 'hash-1',
      longJobUuid: 'old-job',
      artifactUuid: 'old-image',
      uploadUrl: 'http://example.com/old-upload',
      status: 'RETRY_WAITING',
      retryStatus: 'RETRY_WAITING',
      retryCount: 0,
      maxRetryCount: 5,
      fileAvailable: true,
      fileAvailableUntil: new Date(Date.now() + 60 * 1000),
      nextRetryAt: new Date(Date.now() - 1000),
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findAll: jest.fn().mockResolvedValue([row]),
      update: jest.fn().mockResolvedValue([0])
    }
    const retryService = {
      recreateUploadJob: jest.fn()
    }
    const service = createService({
      uploadSessionModel,
      zsSessionModel: {},
      zsLongJobModel: {},
      uploadJobRetryService: retryService
    })

    await service.processRetryWaitingSessions()

    expect(uploadSessionModel.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'RETRYING',
        retryStatus: 'RETRYING',
        retryOwner: expect.any(String),
        retryLockedUntil: expect.any(Date)
      }),
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'row-1',
          status: 'RETRY_WAITING'
        })
      })
    )
    expect(row.update).not.toHaveBeenCalled()
    expect(retryService.recreateUploadJob).not.toHaveBeenCalled()
  })

  it('reschedules due retry sessions when replacement job creation fails', async () => {
    const row = createMutableRow({
      sessionId: 'session-1',
      userUuid: 'user-1',
      accountUuid: 'account-1',
      uploadType: 'image',
      hash: 'hash-1',
      longJobUuid: 'old-job',
      artifactUuid: 'old-image',
      uploadUrl: 'http://example.com/old-upload',
      status: 'RETRY_WAITING',
      retryStatus: 'RETRY_WAITING',
      retryCount: 0,
      maxRetryCount: 5,
      fileAvailable: true,
      fileAvailableUntil: new Date(Date.now() + 60 * 1000),
      nextRetryAt: new Date(Date.now() - 1000),
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findAll: jest.fn().mockResolvedValue([row])
    }
    const retryService = {
      recreateUploadJob: jest.fn().mockRejectedValue(new Error('mn-bs-down'))
    }
    const service = createService({
      uploadSessionModel,
      zsSessionModel: {},
      zsLongJobModel: {},
      uploadJobRetryService: retryService
    })

    await service.processRetryWaitingSessions()

    expect(row.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        status: 'RETRYING',
        retryStatus: 'RETRYING'
      })
    )
    const retryUpdate = row.update.mock.calls[1][0]
    expect(retryUpdate).toEqual(
      expect.objectContaining({
        status: 'RETRY_WAITING',
        retryStatus: 'RETRY_WAITING',
        retryCount: 1,
        retryOwner: null,
        retryLockedUntil: null,
        errorReason: expect.stringContaining('mn-bs-down')
      })
    )
    expect(retryUpdate.nextRetryAt.getTime()).toBeGreaterThan(Date.now() + 4 * 60 * 1000)
    expect(retryUpdate.fileAvailable).toBe(true)
    expect(retryUpdate.fileAvailableUntil.getTime()).toBeGreaterThan(
      retryUpdate.nextRetryAt.getTime()
    )
  })

  it('exhausts retry sessions when the last replacement job creation attempt fails', async () => {
    const row = createMutableRow({
      sessionId: 'session-1',
      uploadType: 'image',
      hash: 'hash-1',
      longJobUuid: 'old-job',
      status: 'RETRY_WAITING',
      retryStatus: 'RETRY_WAITING',
      retryCount: 4,
      maxRetryCount: 5,
      fileAvailable: true,
      fileAvailableUntil: new Date(Date.now() + 60 * 1000),
      nextRetryAt: new Date(Date.now() - 1000),
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findAll: jest.fn().mockResolvedValue([row])
    }
    const retryService = {
      recreateUploadJob: jest.fn().mockRejectedValue(new Error('mn-bs-down'))
    }
    const service = createService({
      uploadSessionModel,
      zsSessionModel: {},
      zsLongJobModel: {},
      uploadJobRetryService: retryService
    })

    await service.processRetryWaitingSessions()

    expect(row.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        status: 'RETRY_EXHAUSTED',
        retryStatus: 'RETRY_EXHAUSTED',
        retryCount: 5,
        nextRetryAt: null,
        retryOwner: null,
        retryLockedUntil: null,
        errorReason: expect.stringContaining('mn-bs-down')
      })
    )
  })

  it('moves due retry sessions to waiting for file when the heartbeat expired', async () => {
    const row = createMutableRow({
      sessionId: 'session-1',
      uploadType: 'image',
      hash: 'hash-1',
      longJobUuid: 'old-job',
      status: 'RETRY_WAITING',
      retryStatus: 'RETRY_WAITING',
      retryCount: 0,
      maxRetryCount: 5,
      fileAvailable: true,
      fileAvailableUntil: new Date(Date.now() - 1000),
      nextRetryAt: new Date(Date.now() - 1000),
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findAll: jest.fn().mockResolvedValue([row])
    }
    const service = createService({ uploadSessionModel, zsSessionModel: {}, zsLongJobModel: {} })

    await service.processRetryWaitingSessions()

    expect(row.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'WAITING_FOR_FILE',
        retryStatus: 'WAITING_FOR_FILE',
        fileAvailable: false,
        nextRetryAt: null
      })
    )
  })

  it('deletes terminal upload sessions after their retention window', async () => {
    const uploadSessionModel = {
      destroy: jest.fn().mockResolvedValue(3)
    }
    const zsSessionModel = {
      findOne: jest.fn()
    }
    const service = createService({ uploadSessionModel, zsSessionModel, zsLongJobModel: {} })

    await service.cleanupTerminalSessions()

    expect(uploadSessionModel.destroy).toHaveBeenCalledTimes(1)
    const where = uploadSessionModel.destroy.mock.calls[0][0].where
    expect(Object.getOwnPropertySymbols(where)).toHaveLength(1)
  })

  it('resolves the storage offset for an existing upload session', async () => {
    const row = createMutableRow({
      sessionId: 'session-1',
      userUuid: 'user-1',
      accountUuid: 'account-1',
      uploadType: 'image',
      hash: 'hash-1',
      fileName: 'image.raw',
      fileSize: 4096,
      longJobUuid: 'job-1',
      artifactUuid: 'image-old',
      uploadUrl: 'http://example.com/old-upload',
      offset: 1024,
      status: 'WAITING_FOR_FILE',
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findOne: jest.fn().mockResolvedValue(row)
    }
    const zsSessionModel = {
      findOne: jest.fn().mockResolvedValue({
        userId: 'user-1',
        accountId: 'account-1'
      })
    }
    const offsetResolver = {
      resolve: jest.fn().mockResolvedValue({
        longJobUuid: 'job-1',
        offset: 3072,
        uploadUrl: 'http://example.com/server-upload',
        artifactUuid: 'image-server'
      })
    }
    const service = createService({
      uploadSessionModel,
      zsSessionModel,
      zsLongJobModel: {},
      uploadOffsetResolver: offsetResolver
    })

    const result = await service.resolveOffset('session-1', 'job-1')

    expect(uploadSessionModel.findOne).toHaveBeenCalledWith({
      where: {
        longJobUuid: 'job-1',
        userUuid: 'user-1',
        accountUuid: 'account-1'
      }
    })
    expect(offsetResolver.resolve).toHaveBeenCalledWith(
      expect.objectContaining({
        uploadType: 'image',
        hash: 'hash-1',
        longJobUuid: 'job-1'
      })
    )
    expect(row.update).toHaveBeenCalledWith(
      expect.objectContaining({
        offset: 3072,
        uploadUrl: 'http://example.com/server-upload',
        artifactUuid: 'image-server',
        lastOpDate: expect.any(Date)
      })
    )
    expect(result).toEqual(
      expect.objectContaining({
        longJobUuid: 'job-1',
        offset: 3072,
        uploadUrl: 'http://example.com/server-upload',
        artifactUuid: 'image-server'
      })
    )
  })

  it('rejects offset resolution when the backend returns another long job uuid', async () => {
    const row = createMutableRow({
      sessionId: 'session-1',
      userUuid: 'user-1',
      accountUuid: 'account-1',
      uploadType: 'image',
      hash: 'hash-1',
      longJobUuid: 'job-1',
      offset: 1024,
      status: 'WAITING_FOR_FILE',
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findOne: jest.fn().mockResolvedValue(row)
    }
    const zsSessionModel = {
      findOne: jest.fn().mockResolvedValue({
        userId: 'user-1',
        accountId: 'account-1'
      })
    }
    const offsetResolver = {
      resolve: jest.fn().mockResolvedValue({
        longJobUuid: 'another-job',
        offset: 3072,
        uploadUrl: 'http://example.com/server-upload',
        artifactUuid: 'image-server'
      })
    }
    const service = createService({
      uploadSessionModel,
      zsSessionModel,
      zsLongJobModel: {},
      uploadOffsetResolver: offsetResolver
    })

    await expect(service.resolveOffset('session-1', 'job-1')).rejects.toThrow(
      'Upload session belongs to another long job'
    )
    expect(row.update).not.toHaveBeenCalled()
  })

  it('resolves an upload proxy target from the current owner scoped long job session', async () => {
    const row = createMutableRow({
      sessionId: 'session-1',
      userUuid: 'user-1',
      accountUuid: 'account-1',
      uploadType: 'image',
      hash: 'hash-1',
      fileName: 'image.raw',
      fileSize: 4096,
      longJobUuid: 'job-1',
      artifactUuid: 'image-1',
      uploadUrl: 'http://backup-storage.example/upload',
      offset: 1024,
      status: 'UPLOADING',
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findOne: jest.fn().mockResolvedValue(row)
    }
    const zsSessionModel = {
      findOne: jest.fn().mockResolvedValue({
        userId: 'user-1',
        accountId: 'account-1'
      })
    }
    const service = createService({ uploadSessionModel, zsSessionModel, zsLongJobModel: {} })

    const target = await service.resolveUploadTarget('session-1', 'job-1', {
      uploadTypes: ['image']
    })

    expect(uploadSessionModel.findOne).toHaveBeenCalledWith({
      where: {
        longJobUuid: 'job-1',
        userUuid: 'user-1',
        accountUuid: 'account-1'
      }
    })
    expect(target).toEqual(
      expect.objectContaining({
        longJobUuid: 'job-1',
        uploadType: 'image',
        uploadUrl: 'http://backup-storage.example/upload',
        artifactUuid: 'image-1'
      })
    )
  })

  it('rejects upload proxy target resolution for terminal sessions', async () => {
    const row = createMutableRow({
      sessionId: 'session-1',
      userUuid: 'user-1',
      accountUuid: 'account-1',
      uploadType: 'image',
      hash: 'hash-1',
      longJobUuid: 'job-1',
      uploadUrl: 'http://backup-storage.example/upload',
      status: 'COMPLETED',
      expiresAt: new Date(Date.now() + 1000)
    })
    const uploadSessionModel = {
      findOne: jest.fn().mockResolvedValue(row)
    }
    const zsSessionModel = {
      findOne: jest.fn().mockResolvedValue({
        userId: 'user-1',
        accountId: 'account-1'
      })
    }
    const service = createService({ uploadSessionModel, zsSessionModel, zsLongJobModel: {} })

    await expect(
      service.resolveUploadTarget('session-1', 'job-1', { uploadTypes: ['image'] })
    ).rejects.toThrow('Upload session is not resumable')
  })
})
