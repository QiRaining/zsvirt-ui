import { SCHEDULE_CRON_OPTIONS } from '@nestjs/schedule/dist/schedule.constants'

import { UploadSessionCronService } from './upload-session-cron.service'
import { UploadSessionService } from './upload-session.service'

describe('UploadSessionCronService', () => {
  const createUploadSessionService = () => ({
    expireStaleSessions: jest.fn().mockResolvedValue(undefined),
    markStaleUploadingSessions: jest.fn().mockResolvedValue(undefined),
    reconcileTerminalLongJobSessions: jest.fn().mockResolvedValue(undefined),
    processRetryWaitingSessions: jest.fn().mockResolvedValue(undefined),
    cleanupTerminalSessions: jest.fn().mockResolvedValue(undefined)
  })

  const createCronService = (uploadSessionService = createUploadSessionService()) => {
    const moduleRef = {
      resolve: jest.fn().mockResolvedValue(uploadSessionService)
    }
    return {
      cronService: new UploadSessionCronService(moduleRef as any),
      moduleRef,
      uploadSessionService
    }
  }

  const getCronTime = (target: () => unknown) =>
    (Reflect as any).getMetadata(SCHEDULE_CRON_OPTIONS, target)?.cronTime

  it('keeps cron metadata on the static wrapper instead of the request-aware upload service', () => {
    expect(getCronTime(UploadSessionService.prototype.expireStaleSessions)).toBeUndefined()
    expect(getCronTime(UploadSessionService.prototype.markStaleUploadingSessions)).toBeUndefined()
    expect(
      getCronTime(UploadSessionService.prototype.reconcileTerminalLongJobSessions)
    ).toBeUndefined()
    expect(getCronTime(UploadSessionService.prototype.processRetryWaitingSessions)).toBeUndefined()
    expect(getCronTime(UploadSessionService.prototype.cleanupTerminalSessions)).toBeUndefined()

    expect(getCronTime(UploadSessionCronService.prototype.expireStaleSessions)).toBe(
      '0 */30 * * * *'
    )
    expect(getCronTime(UploadSessionCronService.prototype.markStaleUploadingSessions)).toBe(
      '0 */10 * * * *'
    )
    expect(getCronTime(UploadSessionCronService.prototype.reconcileTerminalLongJobSessions)).toBe(
      '0 */5 * * * *'
    )
    expect(getCronTime(UploadSessionCronService.prototype.processRetryWaitingSessions)).toBe(
      '0 */1 * * * *'
    )
    expect(getCronTime(UploadSessionCronService.prototype.cleanupTerminalSessions)).toBe(
      '0 15 * * * *'
    )
  })

  it('delegates stale session expiration to UploadSessionService', async () => {
    const { cronService, moduleRef, uploadSessionService } = createCronService()

    await cronService.expireStaleSessions()

    expect(moduleRef.resolve).toHaveBeenCalledWith(UploadSessionService, undefined, {
      strict: false
    })
    expect(uploadSessionService.expireStaleSessions).toHaveBeenCalledTimes(1)
  })

  it('delegates retry waiting processing to UploadSessionService', async () => {
    const { cronService, uploadSessionService } = createCronService()

    await cronService.processRetryWaitingSessions()

    expect(uploadSessionService.processRetryWaitingSessions).toHaveBeenCalledTimes(1)
  })
})
