import { LongJobState } from '@/common/enum'
import { ActionTaskState } from '@/common/model/action.model'

import { CronService } from './cron.service'

describe('CronService', () => {
  const originalInstanceId = process.env.INSTANCE_ID

  afterEach(() => {
    process.env.INSTANCE_ID = originalInstanceId
    jest.restoreAllMocks()
  })

  const createService = () => {
    const cronJob = {
      stop: jest.fn(),
      start: jest.fn()
    }
    const service = new CronService()
    const recordActionService = {
      recordActionSuspended: jest.fn().mockResolvedValue(undefined),
      recordApiSuspended: jest.fn().mockResolvedValue(undefined),
      recordTaskSuspended: jest.fn().mockResolvedValue(undefined)
    }
    const pubSubService = {
      response: jest.fn()
    }
    const zsLongJob = {
      findAll: jest.fn().mockResolvedValue([
        {
          id: 1,
          longJobUuid: 'long-job-1',
          clientJobUuid: 'action-1',
          jobName: 'APIAddImageMsg',
          resourceType: 'Image',
          userId: 'user-1',
          state: 'SUSPENDED'
        }
      ]),
      update: jest.fn().mockResolvedValue([1])
    }

    Object.assign(service as any, {
      schedulerRegistry: {
        getCronJob: jest.fn().mockReturnValue(cronJob)
      },
      zsLongJob,
      zsSession: {
        findAll: jest.fn().mockResolvedValue([{ sessionId: 'session-1' }]),
        findOne: jest.fn().mockResolvedValue({ sessionId: 'admin-session' })
      },
      zsActionApi: {
        update: jest.fn().mockResolvedValue([1])
      },
      queryLongJobAction: {
        call: jest.fn().mockResolvedValue({
          inventories: [
            {
              uuid: 'long-job-1',
              apiId: 'api-1',
              state: LongJobState.Suspended,
              jobResult: '{}'
            }
          ]
        })
      },
      getTaskProgressAction: {
        call: jest.fn()
      },
      recordActionService,
      pubSubService,
      logger: {
        debug: jest.fn(),
        debugJson: jest.fn(),
        error: jest.fn()
      }
    })
    jest.spyOn(service, 'activeNode').mockResolvedValue(true)

    return {
      cronJob,
      pubSubService,
      recordActionService,
      service,
      zsLongJob
    }
  }

  it('keeps outer operation status aligned when the long job remains suspended', async () => {
    process.env.INSTANCE_ID = '0'
    const { cronJob, pubSubService, recordActionService, service, zsLongJob } = createService()

    await service.refreshLongJob()

    expect(zsLongJob.update).toHaveBeenCalledWith({ state: 'SUSPENDED' }, { where: { id: 1 } })
    expect(recordActionService.recordActionSuspended).toHaveBeenCalledWith('action-1')
    expect(recordActionService.recordApiSuspended).toHaveBeenCalledWith('action-1')
    expect(recordActionService.recordTaskSuspended).toHaveBeenCalledWith('action-1')
    expect(pubSubService.response).toHaveBeenCalledWith(
      expect.objectContaining({
        actionId: 'action-1',
        sessionId: 'session-1',
        state: ActionTaskState.suspended,
        type: 'Image'
      })
    )
    expect(cronJob.start).toHaveBeenCalledTimes(1)
  })
})
