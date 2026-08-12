import { BadRequestException } from '@nestjs/common'

import { UploadJobRetryService } from './upload-job-retry.service'

describe('UploadJobRetryService', () => {
  it('recreates an upload long job and records it for the task list', async () => {
    const submitLongJobAction = {
      call: jest.fn().mockResolvedValue({
        inventory: {
          uuid: 'new-long-job'
        }
      })
    }
    const recordActionService = {
      recordActionStart: jest.fn().mockResolvedValue(undefined),
      recordTaskStart: jest.fn().mockResolvedValue(undefined),
      recordActionFailed: jest.fn().mockResolvedValue(undefined),
      recordTaskFailed: jest.fn().mockResolvedValue(undefined)
    }
    const zsLongJobModel = {
      create: jest.fn().mockResolvedValue(undefined)
    }
    const service = new UploadJobRetryService(
      submitLongJobAction as any,
      recordActionService as any,
      zsLongJobModel as any
    )

    const result = await service.recreateUploadJob({
      sessionId: 'session-1',
      userUuid: 'user-1',
      uploadType: 'image',
      hash: 'hash-1',
      longJobUuid: 'old-job',
      jobName: 'APIAddImageMsg',
      jobData: '{"hash":"hash-1","url":"upload://hash-1"}',
      actionName: 'AddImage',
      resourceType: 'Image',
      status: 'RETRY_WAITING',
      offset: 0,
      resumable: true
    })

    expect(recordActionService.recordActionStart).toHaveBeenCalledWith(
      '{"hash":"hash-1","url":"upload://hash-1"}',
      expect.any(String),
      'AddImage',
      expect.objectContaining({
        req: expect.objectContaining({
          headers: expect.objectContaining({
            'x-session-id': 'session-1'
          })
        })
      })
    )
    expect(recordActionService.recordTaskStart).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    )
    expect(submitLongJobAction.call).toHaveBeenCalledWith(
      {
        jobName: 'APIAddImageMsg',
        jobData: '{"hash":"hash-1","url":"upload://hash-1"}',
        systemTags: ['uploadImage::hash-1']
      },
      expect.objectContaining({
        sessionId: 'session-1',
        taskId: expect.any(String),
        actionId: expect.any(String)
      }),
      true
    )
    expect(zsLongJobModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        longJobUuid: 'new-long-job',
        clientJobUuid: expect.any(String),
        jobName: 'APIAddImageMsg',
        resourceType: 'Image',
        data: '{"hash":"hash-1","url":"upload://hash-1"}',
        progress: 0,
        state: 'RUNNING',
        userId: 'user-1'
      })
    )
    expect(result).toEqual({
      longJobUuid: 'new-long-job'
    })
  })

  it('refuses to recreate an upload job without the original payload', async () => {
    const service = new UploadJobRetryService({} as any, {} as any, {} as any)

    await expect(
      service.recreateUploadJob({
        sessionId: 'session-1',
        uploadType: 'image',
        hash: 'hash-1',
        longJobUuid: 'old-job',
        status: 'RETRY_WAITING',
        offset: 0,
        resumable: true
      })
    ).rejects.toBeInstanceOf(BadRequestException)
  })
})
