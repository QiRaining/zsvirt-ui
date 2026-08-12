import { Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { Cron } from '@nestjs/schedule'

import { UploadSessionService } from './upload-session.service'

@Injectable()
export class UploadSessionCronService {
  constructor(private readonly moduleRef: ModuleRef) {}

  @Cron('0 */30 * * * *')
  async expireStaleSessions(): Promise<void> {
    await (await this.getUploadSessionService()).expireStaleSessions()
  }

  @Cron('0 */10 * * * *')
  async markStaleUploadingSessions(): Promise<void> {
    await (await this.getUploadSessionService()).markStaleUploadingSessions()
  }

  @Cron('0 */5 * * * *')
  async reconcileTerminalLongJobSessions(): Promise<void> {
    await (await this.getUploadSessionService()).reconcileTerminalLongJobSessions()
  }

  @Cron('0 */1 * * * *')
  async processRetryWaitingSessions(): Promise<void> {
    await (await this.getUploadSessionService()).processRetryWaitingSessions()
  }

  @Cron('0 15 * * * *')
  async cleanupTerminalSessions(): Promise<void> {
    await (await this.getUploadSessionService()).cleanupTerminalSessions()
  }

  private async getUploadSessionService(): Promise<UploadSessionService> {
    return this.moduleRef.resolve(UploadSessionService, undefined, { strict: false })
  }
}
