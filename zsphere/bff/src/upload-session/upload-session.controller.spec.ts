import { NotFoundException } from '@nestjs/common'

import { UploadSessionController } from './upload-session.controller'

describe('UploadSessionController', () => {
  it('returns 404 when resolving offset for a missing upload session', async () => {
    const uploadSessionService = {
      resolveOffset: jest.fn().mockResolvedValue(null)
    }
    const controller = new UploadSessionController(uploadSessionService as any)

    await expect(controller.resolveOffset('session-1', 'job-missing')).rejects.toThrow(
      NotFoundException
    )
    expect(uploadSessionService.resolveOffset).toHaveBeenCalledWith('session-1', 'job-missing')
  })

  it('updates file availability for an upload session', async () => {
    const uploadSessionService = {
      updateFileAvailability: jest.fn().mockResolvedValue({
        longJobUuid: 'job-1',
        status: 'RETRY_WAITING'
      })
    }
    const controller = new UploadSessionController(uploadSessionService as any)

    const session = await controller.updateFileAvailability('session-1', 'job-1', {
      fileAvailable: true
    })

    expect(uploadSessionService.updateFileAvailability).toHaveBeenCalledWith('session-1', 'job-1', {
      fileAvailable: true
    })
    expect(session).toEqual(
      expect.objectContaining({
        longJobUuid: 'job-1',
        status: 'RETRY_WAITING'
      })
    )
  })
})
