import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'

import { Logger } from '@/common/logger/logger.decorator'
import type { ZSLoggerService } from '@/common/logger/logger.service'
import { ZsResumableUploadSession } from '@/model/resumable-upload-session.model'
import { ZsLongJob } from '@/model/zs-long-job.model'
import { ZsSession } from '@/model/zs-session.model'

import { UploadJobRetryService } from './upload-job-retry.service'
import { UploadOffsetResolverService } from './upload-offset-resolver.service'

export type UploadSessionType = 'image' | 'storagePackage' | 'migrationServicePackage'

export type UploadSessionStatus =
  | 'UPLOADING'
  | 'WAITING_FOR_FILE_CHECK'
  | 'RETRY_WAITING'
  | 'RETRYING'
  | 'RETRY_READY'
  | 'WAITING_FOR_FILE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELED'
  | 'RETRY_EXHAUSTED'
  | 'EXPIRED'

export interface RegisterUploadSessionPayload {
  uploadType: UploadSessionType
  hash: string
  fileName?: string
  fileSize?: number
  lastModified?: number
  longJobUuid: string
  artifactUuid?: string
  uploadUrl?: string
  offset?: number
  status?: UploadSessionStatus
  errorReason?: string
  jobName?: string
  jobData?: string
  actionName?: string
  resourceType?: string
  retryCount?: number
  maxRetryCount?: number
  nextRetryAt?: string | Date
  lastRetryAt?: string | Date
  retryStatus?: UploadSessionStatus | string
  fileAvailable?: boolean
  fileAvailableUntil?: string | Date
  rootSessionId?: string
  replacedFromLongJobUuid?: string
  previousLongJobUuid?: string
  retryOwner?: string
  retryLockedUntil?: string | Date
  expiresAt?: string | Date
}

export interface UpdateUploadSessionPayload {
  longJobUuid?: string
  offset?: number
  status?: UploadSessionStatus
  uploadUrl?: string | null
  artifactUuid?: string | null
  errorReason?: string
  jobName?: string
  jobData?: string
  actionName?: string
  resourceType?: string
  retryCount?: number
  maxRetryCount?: number
  nextRetryAt?: string | Date | null
  lastRetryAt?: string | Date | null
  retryStatus?: UploadSessionStatus | string
  fileAvailable?: boolean
  fileAvailableUntil?: string | Date | null
  rootSessionId?: string
  replacedFromLongJobUuid?: string
  previousLongJobUuid?: string
  retryOwner?: string | null
  retryLockedUntil?: string | Date | null
  expiresAt?: string | Date
}

export interface UpdateUploadFileAvailabilityPayload {
  fileAvailable: boolean
}

export interface UploadSessionDto extends RegisterUploadSessionPayload {
  sessionId?: string
  userUuid?: string
  accountUuid?: string
  status: UploadSessionStatus
  offset: number
  resumable: boolean
  createDate?: Date
  lastOpDate?: Date
  jobName?: string
  jobData?: string
  actionName?: string
  resourceType?: string
  retryCount?: number
  maxRetryCount?: number
  nextRetryAt?: Date
  lastRetryAt?: Date
  retryStatus?: string
  fileAvailable?: boolean
  fileAvailableUntil?: Date
  rootSessionId?: string
  replacedFromLongJobUuid?: string
  previousLongJobUuid?: string
  retryOwner?: string
  retryLockedUntil?: Date
}

interface UploadSessionOwner {
  sessionId: string
  userUuid?: string
  accountUuid?: string
}

export interface UploadJobRetryResult {
  longJobUuid: string
  artifactUuid?: string
  uploadUrl?: string
}

export interface UploadJobRetryServiceLike {
  recreateUploadJob(session: UploadSessionDto): Promise<UploadJobRetryResult>
}

export interface ResolveUploadTargetOptions {
  uploadTypes?: UploadSessionType[]
}

export interface ResolvedUploadTarget {
  longJobUuid: string
  uploadType: UploadSessionType
  uploadUrl: string
  artifactUuid?: string
  fileSize?: number
}

type UploadSessionUpdateData = Partial<
  Pick<
    ZsResumableUploadSession,
    | 'longJobUuid'
    | 'offset'
    | 'status'
    | 'uploadUrl'
    | 'artifactUuid'
    | 'errorReason'
    | 'jobName'
    | 'jobData'
    | 'actionName'
    | 'resourceType'
    | 'retryCount'
    | 'maxRetryCount'
    | 'nextRetryAt'
    | 'lastRetryAt'
    | 'retryStatus'
    | 'fileAvailable'
    | 'fileAvailableUntil'
    | 'rootSessionId'
    | 'replacedFromLongJobUuid'
    | 'previousLongJobUuid'
    | 'retryOwner'
    | 'retryLockedUntil'
    | 'expiresAt'
  >
> & {
  lastOpDate: Date
}

const RESUMABLE_UPLOAD_SESSION_STATUSES: UploadSessionStatus[] = [
  'UPLOADING',
  'WAITING_FOR_FILE_CHECK',
  'RETRY_WAITING',
  'RETRYING',
  'RETRY_READY',
  'WAITING_FOR_FILE',
  'PAUSED',
  'RETRY_EXHAUSTED'
]

const TERMINAL_UPLOAD_SESSION_STATUSES: UploadSessionStatus[] = [
  'COMPLETED',
  'FAILED',
  'CANCELED',
  'EXPIRED'
]

const UPLOAD_SESSION_TTL = 72 * 60 * 60 * 1000
const STALE_UPLOADING_SESSION_DURATION = 30 * 60 * 1000
const FILE_AVAILABLE_HEARTBEAT_TTL = 2 * 60 * 1000
const RETRY_LOCK_DURATION = 5 * 60 * 1000
const DEFAULT_TERMINAL_SESSION_RETENTION = 7 * 24 * 60 * 60 * 1000
const FAILED_SESSION_RETENTION = 30 * 24 * 60 * 60 * 1000
export const UPLOAD_JOB_RETRY_DELAYS = [
  3 * 60 * 1000,
  5 * 60 * 1000,
  10 * 60 * 1000,
  15 * 60 * 1000,
  30 * 60 * 1000
]
const DEFAULT_MAX_RETRY_COUNT = UPLOAD_JOB_RETRY_DELAYS.length
const TERMINAL_LONG_JOB_STATUS_MAP: Record<string, UploadSessionStatus> = {
  SUCCESS: 'COMPLETED',
  SUCCEEDED: 'COMPLETED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELED: 'CANCELED',
  CANCELLED: 'CANCELED'
}
const SUSPENDED_LONG_JOB_STATUSES = ['SUSPENDED']
const FILE_AVAILABLE_RETRY_SCHEDULING_STATUSES: UploadSessionStatus[] = [
  'WAITING_FOR_FILE_CHECK',
  'RETRY_WAITING'
]
const FAILED_LONG_JOB_FILE_CHECK_STATUSES: UploadSessionStatus[] = ['UPLOADING', 'RETRY_READY']
const FAILED_LONG_JOB_RETRY_ORCHESTRATION_STATUSES: UploadSessionStatus[] = [
  'WAITING_FOR_FILE_CHECK',
  'RETRY_WAITING',
  'RETRYING',
  'RETRY_READY',
  'WAITING_FOR_FILE',
  'PAUSED',
  'RETRY_EXHAUSTED'
]

export const getUploadJobRetryDelayMs = (retryCount = 0): number =>
  UPLOAD_JOB_RETRY_DELAYS[Math.min(Math.max(retryCount, 0), UPLOAD_JOB_RETRY_DELAYS.length - 1)]

@Injectable()
export class UploadSessionService {
  @InjectModel(ZsResumableUploadSession)
  private readonly uploadSessionModel: typeof ZsResumableUploadSession

  @InjectModel(ZsSession)
  private readonly zsSessionModel: typeof ZsSession

  @InjectModel(ZsLongJob)
  private readonly zsLongJobModel: typeof ZsLongJob

  @Inject()
  private readonly uploadOffsetResolver?: UploadOffsetResolverService

  @Inject()
  private readonly uploadJobRetryService?: UploadJobRetryService

  @Logger(UploadSessionService.name)
  private readonly logger?: ZSLoggerService

  async register(
    sessionId: string,
    payload: RegisterUploadSessionPayload
  ): Promise<UploadSessionDto> {
    const owner = await this.resolveOwner(sessionId)
    const now = new Date()
    const expiresAt =
      this.resolveDate(payload.expiresAt) ?? new Date(now.getTime() + UPLOAD_SESSION_TTL)
    const data = {
      sessionId: owner.sessionId,
      userUuid: owner.userUuid,
      accountUuid: owner.accountUuid,
      uploadType: payload.uploadType,
      hash: payload.hash,
      fileName: payload.fileName,
      fileSize: payload.fileSize,
      lastModified: payload.lastModified,
      longJobUuid: payload.longJobUuid,
      artifactUuid: payload.artifactUuid,
      uploadUrl: payload.uploadUrl,
      offset: payload.offset ?? 0,
      status: payload.status ?? 'UPLOADING',
      errorReason: payload.errorReason,
      jobName: payload.jobName,
      jobData: payload.jobData,
      actionName: payload.actionName,
      resourceType: payload.resourceType,
      retryCount: payload.retryCount ?? 0,
      maxRetryCount: payload.maxRetryCount ?? DEFAULT_MAX_RETRY_COUNT,
      nextRetryAt: this.resolveNullableDate(payload.nextRetryAt),
      lastRetryAt: this.resolveNullableDate(payload.lastRetryAt),
      retryStatus: payload.retryStatus,
      fileAvailable: payload.fileAvailable ?? false,
      fileAvailableUntil: this.resolveNullableDate(payload.fileAvailableUntil),
      rootSessionId: payload.rootSessionId ?? payload.longJobUuid,
      replacedFromLongJobUuid: payload.replacedFromLongJobUuid,
      previousLongJobUuid: payload.previousLongJobUuid,
      retryOwner: payload.retryOwner,
      retryLockedUntil: this.resolveNullableDate(payload.retryLockedUntil),
      expiresAt,
      lastOpDate: now
    }

    this.logUploadResume('session-register', {
      longJobUuid: payload.longJobUuid,
      uploadType: payload.uploadType,
      jobName: payload.jobName,
      status: data.status,
      rootSessionId: data.rootSessionId,
      retryCount: data.retryCount,
      maxRetryCount: data.maxRetryCount,
      hasJobData: Boolean(payload.jobData),
      hasUploadUrl: Boolean(payload.uploadUrl),
      hasOwner: Boolean(owner.userUuid)
    })

    const existing = await this.uploadSessionModel.findOne({
      where: { longJobUuid: payload.longJobUuid, ...this.getOwnerWhere(owner) }
    })

    if (existing) {
      await existing.update(data)
      return this.toDto(existing)
    }

    const created = await this.uploadSessionModel.create({
      ...data,
      createDate: now
    } as ZsResumableUploadSession)
    return this.toDto(created)
  }

  async listResumable(sessionId: string): Promise<UploadSessionDto[]> {
    const owner = await this.resolveOwner(sessionId)
    const now = new Date()
    const where = {
      status: { [Op.in]: RESUMABLE_UPLOAD_SESSION_STATUSES },
      expiresAt: { [Op.gt]: now }
    }

    const sessions = await this.uploadSessionModel.findAll({
      where: { ...where, ...this.getOwnerWhere(owner) },
      order: [['lastOpDate', 'DESC']]
    })
    const terminalLongJobUuids = await this.syncTerminalLongJobs(sessions)
    return sessions
      .filter(session => !terminalLongJobUuids.has(session.longJobUuid))
      .map(session => this.toDto(session))
  }

  async update(
    sessionId: string,
    longJobUuid: string,
    payload: UpdateUploadSessionPayload
  ): Promise<UploadSessionDto | null> {
    const owner = await this.resolveOwner(sessionId)
    const session = await this.uploadSessionModel.findOne({
      where: { longJobUuid, ...this.getOwnerWhere(owner) }
    })

    if (!session) {
      return null
    }

    await session.update(this.compactUpdatePayload(payload))
    return this.toDto(session)
  }

  async updateFileAvailability(
    sessionId: string,
    longJobUuid: string,
    payload: UpdateUploadFileAvailabilityPayload
  ): Promise<UploadSessionDto | null> {
    const owner = await this.resolveOwner(sessionId)
    const session = await this.uploadSessionModel.findOne({
      where: { longJobUuid, ...this.getOwnerWhere(owner) }
    })

    if (!session) {
      return null
    }

    const now = new Date()
    const retryCount = this.toFiniteNumber((session as any).retryCount, 0)
    const maxRetryCount = this.toFiniteNumber(
      (session as any).maxRetryCount,
      DEFAULT_MAX_RETRY_COUNT
    )

    this.logUploadResume('file-availability', {
      longJobUuid,
      rootSessionId: (session as any).rootSessionId,
      status: session.status,
      fileAvailable: payload.fileAvailable,
      retryCount,
      maxRetryCount,
      nextRetryAt: (session as any).nextRetryAt,
      fileAvailableUntil: (session as any).fileAvailableUntil
    })

    if (!payload.fileAvailable) {
      this.logUploadResume('file-availability-transition', {
        longJobUuid,
        rootSessionId: (session as any).rootSessionId,
        fromStatus: session.status,
        nextStatus: 'WAITING_FOR_FILE',
        reason: 'file-unavailable',
        retryCount,
        maxRetryCount
      })
      await session.update(
        this.compactUpdatePayload({
          status: 'WAITING_FOR_FILE',
          retryStatus: 'WAITING_FOR_FILE',
          fileAvailable: false,
          fileAvailableUntil: null,
          nextRetryAt: null,
          retryOwner: null,
          retryLockedUntil: null
        })
      )
      return this.toDto(session)
    }

    if (!FILE_AVAILABLE_RETRY_SCHEDULING_STATUSES.includes(session.status as UploadSessionStatus)) {
      this.logUploadResume('file-availability-transition', {
        longJobUuid,
        rootSessionId: (session as any).rootSessionId,
        fromStatus: session.status,
        nextStatus: session.status,
        reason: 'heartbeat-only',
        retryCount,
        maxRetryCount
      })
      await session.update(
        this.compactUpdatePayload({
          fileAvailable: true,
          fileAvailableUntil: new Date(now.getTime() + FILE_AVAILABLE_HEARTBEAT_TTL),
          maxRetryCount
        })
      )
      return this.toDto(session)
    }

    if (retryCount >= maxRetryCount) {
      this.logUploadResume('file-availability-transition', {
        longJobUuid,
        rootSessionId: (session as any).rootSessionId,
        fromStatus: session.status,
        nextStatus: 'RETRY_EXHAUSTED',
        reason: 'retry-exhausted',
        retryCount,
        maxRetryCount
      })
      await session.update(
        this.compactUpdatePayload({
          status: 'RETRY_EXHAUSTED',
          retryStatus: 'RETRY_EXHAUSTED',
          fileAvailable: true,
          fileAvailableUntil: new Date(now.getTime() + FILE_AVAILABLE_HEARTBEAT_TTL),
          nextRetryAt: null
        })
      )
      return this.toDto(session)
    }

    const nextRetryAt =
      session.status === 'RETRY_WAITING' && (session as any).nextRetryAt
        ? (session as any).nextRetryAt
        : new Date(now.getTime() + getUploadJobRetryDelayMs(retryCount))
    const fileAvailableUntil = this.getFileAvailabilityHeartbeatUntil(now, nextRetryAt)

    this.logUploadResume('file-availability-transition', {
      longJobUuid,
      rootSessionId: (session as any).rootSessionId,
      fromStatus: session.status,
      nextStatus: 'RETRY_WAITING',
      reason: 'file-available',
      retryCount,
      maxRetryCount,
      nextRetryAt
    })

    await session.update(
      this.compactUpdatePayload({
        status: 'RETRY_WAITING',
        retryStatus: 'RETRY_WAITING',
        fileAvailable: true,
        fileAvailableUntil,
        nextRetryAt,
        maxRetryCount
      })
    )
    return this.toDto(session)
  }

  async resolveOffset(sessionId: string, longJobUuid: string): Promise<UploadSessionDto | null> {
    const owner = await this.resolveOwner(sessionId)
    const session = await this.uploadSessionModel.findOne({
      where: { longJobUuid, ...this.getOwnerWhere(owner) }
    })

    if (!session) {
      return null
    }

    if (!this.uploadOffsetResolver) {
      return this.toDto(session)
    }

    const resolved = await this.uploadOffsetResolver.resolve(this.toDto(session))
    if (resolved.longJobUuid && resolved.longJobUuid !== longJobUuid) {
      throw new BadRequestException('Upload session belongs to another long job')
    }

    await session.update(
      this.compactUpdatePayload({
        offset: resolved.offset,
        uploadUrl: resolved.uploadUrl,
        artifactUuid: resolved.artifactUuid
      })
    )
    return this.toDto(session)
  }

  async resolveUploadTarget(
    sessionId: string,
    longJobUuid: string,
    options: ResolveUploadTargetOptions = {}
  ): Promise<ResolvedUploadTarget | null> {
    const owner = await this.resolveOwner(sessionId)
    const session = await this.uploadSessionModel.findOne({
      where: { longJobUuid, ...this.getOwnerWhere(owner) }
    })

    if (!session) {
      return null
    }

    const dto = this.toDto(session)
    if (options.uploadTypes?.length && !options.uploadTypes.includes(dto.uploadType)) {
      throw new BadRequestException('Upload session type does not match upload proxy route')
    }

    if (!dto.resumable) {
      throw new BadRequestException('Upload session is not resumable')
    }

    if (!dto.uploadUrl || dto.uploadUrl.trim() === '') {
      throw new BadRequestException('Upload session upload target is missing')
    }

    return {
      longJobUuid: dto.longJobUuid,
      uploadType: dto.uploadType,
      uploadUrl: dto.uploadUrl,
      artifactUuid: dto.artifactUuid,
      fileSize: dto.fileSize
    }
  }

  async expireStaleSessions(): Promise<void> {
    await this.uploadSessionModel.update(
      {
        status: 'EXPIRED',
        lastOpDate: new Date()
      },
      {
        where: {
          status: { [Op.in]: RESUMABLE_UPLOAD_SESSION_STATUSES },
          expiresAt: { [Op.lte]: new Date() }
        }
      }
    )
  }

  async markStaleUploadingSessions(): Promise<void> {
    await this.reconcileTerminalLongJobSessions()

    const now = new Date()
    const staleBefore = new Date(now.getTime() - STALE_UPLOADING_SESSION_DURATION)

    await this.uploadSessionModel.update(
      {
        status: 'WAITING_FOR_FILE',
        retryStatus: 'WAITING_FOR_FILE',
        fileAvailable: false,
        nextRetryAt: null,
        lastOpDate: now
      },
      {
        where: {
          status: 'UPLOADING',
          lastOpDate: { [Op.lte]: staleBefore },
          expiresAt: { [Op.gt]: now }
        }
      }
    )

    await this.uploadSessionModel.update(
      {
        status: 'WAITING_FOR_FILE',
        retryStatus: 'WAITING_FOR_FILE',
        fileAvailable: false,
        nextRetryAt: null,
        lastOpDate: now
      },
      {
        where: {
          status: { [Op.in]: ['WAITING_FOR_FILE_CHECK', 'RETRY_WAITING', 'RETRYING'] },
          fileAvailable: true,
          fileAvailableUntil: { [Op.lte]: now },
          expiresAt: { [Op.gt]: now }
        }
      }
    )
  }

  async reconcileTerminalLongJobSessions(): Promise<void> {
    const sessions = await this.uploadSessionModel.findAll({
      where: {
        status: { [Op.in]: RESUMABLE_UPLOAD_SESSION_STATUSES },
        expiresAt: { [Op.gt]: new Date() }
      }
    })
    await this.syncTerminalLongJobs(sessions)
  }

  async processRetryWaitingSessions(): Promise<void> {
    const now = new Date()
    const sessions = await this.uploadSessionModel.findAll({
      where: {
        status: 'RETRY_WAITING',
        nextRetryAt: { [Op.lte]: now },
        expiresAt: { [Op.gt]: now }
      },
      order: [['nextRetryAt', 'ASC']]
    })

    this.logUploadResume('retry-waiting-scan', {
      count: sessions.length,
      now
    })

    await Promise.all(sessions.map(session => this.processRetryWaitingSession(session, now)))
  }

  async cleanupTerminalSessions(): Promise<void> {
    const now = Date.now()
    const defaultRetentionBefore = new Date(now - DEFAULT_TERMINAL_SESSION_RETENTION)
    const failedRetentionBefore = new Date(now - FAILED_SESSION_RETENTION)

    await this.uploadSessionModel.destroy({
      where: {
        [Op.or]: [
          {
            status: { [Op.in]: ['COMPLETED', 'CANCELED', 'EXPIRED'] },
            lastOpDate: { [Op.lte]: defaultRetentionBefore }
          },
          {
            status: 'FAILED',
            lastOpDate: { [Op.lte]: failedRetentionBefore }
          }
        ]
      }
    })
  }

  private async resolveOwner(sessionId?: string): Promise<UploadSessionOwner> {
    const normalizedSessionId = sessionId ?? ''
    const session = normalizedSessionId
      ? await this.zsSessionModel.findOne({
          where: { sessionId: normalizedSessionId }
        })
      : null

    return {
      sessionId: normalizedSessionId,
      userUuid: session?.userId,
      accountUuid: session?.accountId
    }
  }

  private getOwnerWhere(owner: UploadSessionOwner) {
    if (!owner.userUuid) {
      return { sessionId: owner.sessionId }
    }
    return {
      userUuid: owner.userUuid,
      ...(owner.accountUuid ? { accountUuid: owner.accountUuid } : {})
    }
  }

  private async processRetryWaitingSession(
    session: ZsResumableUploadSession,
    now: Date
  ): Promise<void> {
    const retryCount = this.toFiniteNumber((session as any).retryCount, 0)
    const maxRetryCount = this.toFiniteNumber(
      (session as any).maxRetryCount,
      DEFAULT_MAX_RETRY_COUNT
    )
    const fileAvailableUntil = this.resolveDate((session as any).fileAvailableUntil)

    this.logUploadResume('retry-session-check', {
      longJobUuid: session.longJobUuid,
      rootSessionId: (session as any).rootSessionId,
      status: session.status,
      retryCount,
      maxRetryCount,
      fileAvailable: (session as any).fileAvailable,
      fileAvailableUntil,
      nextRetryAt: (session as any).nextRetryAt
    })

    if (!(session as any).fileAvailable || !fileAvailableUntil || fileAvailableUntil <= now) {
      this.logUploadResume('retry-session-transition', {
        longJobUuid: session.longJobUuid,
        rootSessionId: (session as any).rootSessionId,
        fromStatus: session.status,
        nextStatus: 'WAITING_FOR_FILE',
        reason: 'file-heartbeat-expired',
        retryCount,
        maxRetryCount
      })
      await session.update(
        this.compactUpdatePayload({
          status: 'WAITING_FOR_FILE',
          retryStatus: 'WAITING_FOR_FILE',
          fileAvailable: false,
          fileAvailableUntil: null,
          nextRetryAt: null,
          retryOwner: null,
          retryLockedUntil: null
        })
      )
      return
    }

    if (retryCount >= maxRetryCount) {
      this.logUploadResume('retry-session-transition', {
        longJobUuid: session.longJobUuid,
        rootSessionId: (session as any).rootSessionId,
        fromStatus: session.status,
        nextStatus: 'RETRY_EXHAUSTED',
        reason: 'retry-exhausted',
        retryCount,
        maxRetryCount
      })
      await session.update(
        this.compactUpdatePayload({
          status: 'RETRY_EXHAUSTED',
          retryStatus: 'RETRY_EXHAUSTED',
          nextRetryAt: null,
          retryOwner: null,
          retryLockedUntil: null
        })
      )
      return
    }

    const retryOwner = this.getRetryOwner()
    const retryLockedUntil = new Date(now.getTime() + RETRY_LOCK_DURATION)
    const claimPayload = this.compactUpdatePayload({
      status: 'RETRYING',
      retryStatus: 'RETRYING',
      retryOwner,
      retryLockedUntil
    })

    this.logUploadResume('retry-session-transition', {
      longJobUuid: session.longJobUuid,
      rootSessionId: (session as any).rootSessionId,
      fromStatus: session.status,
      nextStatus: 'RETRYING',
      reason: 'retry-due',
      retryCount,
      maxRetryCount
    })

    const claimed = await this.claimRetryWaitingSession(session, now, claimPayload)
    if (!claimed) {
      this.logUploadResume('retry-session-skip', {
        longJobUuid: session.longJobUuid,
        rootSessionId: (session as any).rootSessionId,
        status: session.status,
        reason: 'retry-lock-not-acquired',
        retryCount,
        maxRetryCount
      })
      return
    }

    if (!this.uploadJobRetryService) {
      await this.handleRetryJobCreationFailed(
        session,
        retryCount,
        maxRetryCount,
        now,
        'Upload job retry service is unavailable'
      )
      return
    }

    const oldLongJobUuid = session.longJobUuid
    let result: UploadJobRetryResult
    try {
      this.logUploadResume('retry-job-recreate-start', {
        oldLongJobUuid,
        rootSessionId: (session as any).rootSessionId,
        uploadType: (session as any).uploadType,
        jobName: (session as any).jobName,
        retryCount,
        maxRetryCount,
        hasJobData: Boolean((session as any).jobData)
      })
      result = await this.uploadJobRetryService.recreateUploadJob(this.toDto(session))
    } catch (error) {
      await this.handleRetryJobCreationFailed(session, retryCount, maxRetryCount, now, error)
      return
    }

    this.logUploadResume('retry-job-recreate-success', {
      oldLongJobUuid,
      newLongJobUuid: result.longJobUuid,
      rootSessionId: (session as any).rootSessionId,
      nextStatus: 'RETRY_READY',
      retryCount: retryCount + 1,
      maxRetryCount,
      hasArtifactUuid: Boolean(result.artifactUuid),
      hasUploadUrl: Boolean(result.uploadUrl)
    })

    await session.update(
      this.compactUpdatePayload({
        status: 'RETRY_READY',
        retryStatus: 'RETRY_READY',
        retryCount: retryCount + 1,
        lastRetryAt: now,
        nextRetryAt: null,
        longJobUuid: result.longJobUuid,
        artifactUuid: result.artifactUuid ?? null,
        uploadUrl: result.uploadUrl ?? null,
        offset: 0,
        previousLongJobUuid: oldLongJobUuid,
        replacedFromLongJobUuid: (session as any).replacedFromLongJobUuid ?? oldLongJobUuid,
        rootSessionId: (session as any).rootSessionId ?? oldLongJobUuid,
        retryOwner: null,
        retryLockedUntil: null
      })
    )
  }

  private async handleRetryJobCreationFailed(
    session: ZsResumableUploadSession,
    retryCount: number,
    maxRetryCount: number,
    now: Date,
    error: unknown
  ): Promise<void> {
    const nextRetryCount = retryCount + 1
    const errorReason = this.stringifyRetryError(error)

    if (nextRetryCount >= maxRetryCount) {
      this.logUploadResume('retry-job-recreate-failed', {
        longJobUuid: session.longJobUuid,
        rootSessionId: (session as any).rootSessionId,
        nextStatus: 'RETRY_EXHAUSTED',
        retryCount: nextRetryCount,
        maxRetryCount,
        errorReason: this.truncateLogValue(errorReason)
      })
      await session.update(
        this.compactUpdatePayload({
          status: 'RETRY_EXHAUSTED',
          retryStatus: 'RETRY_EXHAUSTED',
          retryCount: nextRetryCount,
          lastRetryAt: now,
          nextRetryAt: null,
          retryOwner: null,
          retryLockedUntil: null,
          errorReason
        })
      )
      return
    }

    const nextRetryAt = new Date(now.getTime() + getUploadJobRetryDelayMs(nextRetryCount))
    const fileAvailableUntil = this.getRetryFailureFileAvailableUntil(session, now, nextRetryAt)
    this.logUploadResume('retry-job-recreate-failed', {
      longJobUuid: session.longJobUuid,
      rootSessionId: (session as any).rootSessionId,
      nextStatus: 'RETRY_WAITING',
      retryCount: nextRetryCount,
      maxRetryCount,
      nextRetryAt,
      fileAvailableUntil,
      errorReason: this.truncateLogValue(errorReason)
    })

    await session.update(
      this.compactUpdatePayload({
        status: 'RETRY_WAITING',
        retryStatus: 'RETRY_WAITING',
        retryCount: nextRetryCount,
        lastRetryAt: now,
        nextRetryAt,
        fileAvailable: fileAvailableUntil ? true : undefined,
        fileAvailableUntil,
        retryOwner: null,
        retryLockedUntil: null,
        errorReason
      })
    )
  }

  private async claimRetryWaitingSession(
    session: ZsResumableUploadSession,
    now: Date,
    claimPayload: UploadSessionUpdateData
  ): Promise<boolean> {
    if (typeof this.uploadSessionModel?.update !== 'function') {
      await session.update(claimPayload)
      return true
    }

    const where = {
      ...((session as any).id ? { id: (session as any).id } : { longJobUuid: session.longJobUuid }),
      status: 'RETRY_WAITING',
      nextRetryAt: { [Op.lte]: now },
      expiresAt: { [Op.gt]: now },
      [Op.or]: [{ retryLockedUntil: null }, { retryLockedUntil: { [Op.lte]: now } }]
    }
    const [affectedCount] = await this.uploadSessionModel.update(claimPayload, { where })

    if (!affectedCount) {
      return false
    }

    Object.assign(session, claimPayload)
    return true
  }

  private getRetryFailureFileAvailableUntil(
    session: ZsResumableUploadSession,
    now: Date,
    nextRetryAt: Date
  ): Date | undefined {
    const currentFileAvailableUntil = this.resolveDate((session as any).fileAvailableUntil)
    if (
      !(session as any).fileAvailable ||
      !currentFileAvailableUntil ||
      currentFileAvailableUntil <= now
    ) {
      return undefined
    }

    return new Date(
      Math.max(
        currentFileAvailableUntil.getTime(),
        nextRetryAt.getTime() + FILE_AVAILABLE_HEARTBEAT_TTL
      )
    )
  }

  private getFileAvailabilityHeartbeatUntil(now: Date, nextRetryAt?: Date | string | null): Date {
    const heartbeatUntil = new Date(now.getTime() + FILE_AVAILABLE_HEARTBEAT_TTL)
    const resolvedNextRetryAt = this.resolveDate(nextRetryAt)
    if (!resolvedNextRetryAt) {
      return heartbeatUntil
    }

    return new Date(
      Math.max(
        heartbeatUntil.getTime(),
        resolvedNextRetryAt.getTime() + FILE_AVAILABLE_HEARTBEAT_TTL
      )
    )
  }

  private stringifyRetryError(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message
    }
    if (typeof error === 'string' && error) {
      return error
    }
    return 'Failed to recreate upload job'
  }

  private getRetryOwner(): string {
    return process.env.HOSTNAME ?? process.env.INSTANCE_ID ?? 'zsv-bff'
  }

  private async syncTerminalLongJobs(sessions: ZsResumableUploadSession[]): Promise<Set<string>> {
    const longJobUuids = Array.from(
      new Set(
        sessions
          .map(session => session.longJobUuid)
          .filter((longJobUuid): longJobUuid is string => Boolean(longJobUuid))
      )
    )

    if (!longJobUuids.length) {
      return new Set()
    }

    const longJobs = await this.zsLongJobModel.findAll({
      where: {
        longJobUuid: { [Op.in]: longJobUuids }
      }
    })
    const longJobMap = new Map(longJobs.map(longJob => [longJob.longJobUuid, longJob]))
    const terminalLongJobUuids = new Set<string>()
    const now = new Date()

    await Promise.all(
      sessions.map(async session => {
        const longJob = longJobMap.get(session.longJobUuid)
        const longJobState = longJob?.state
        const terminalStatus = this.getTerminalStatus(longJobState)
        this.logUploadResume('session-longjob-sync', {
          longJobUuid: session.longJobUuid,
          rootSessionId: (session as any).rootSessionId,
          sessionStatus: session.status,
          longJobState,
          terminalStatus,
          retryCount: (session as any).retryCount,
          retryStatus: (session as any).retryStatus
        })
        if (terminalStatus) {
          if (terminalStatus === 'FAILED') {
            if (this.canRetryFailedLongJob(session, now)) {
              const updatePayload = this.buildRetryableLongJobPayload(
                session,
                longJob,
                now,
                this.getTerminalLongJobReason(session.longJobUuid, terminalStatus)
              )
              this.logUploadResume('session-state-sync', {
                longJobUuid: session.longJobUuid,
                rootSessionId: (session as any).rootSessionId,
                longJobState,
                fromStatus: session.status,
                nextStatus: updatePayload.status,
                retryStatus: updatePayload.retryStatus,
                reason: 'failed-longjob',
                retryCount: updatePayload.retryCount,
                maxRetryCount: updatePayload.maxRetryCount,
                nextRetryAt: updatePayload.nextRetryAt,
                fileAvailable: updatePayload.fileAvailable,
                hasJobData: Boolean(updatePayload.jobData)
              })
              await session.update(
                this.compactUpdatePayload({
                  ...updatePayload
                })
              )
              return
            }
            if (this.isFailedLongJobRetryOrchestrationStatus(session)) {
              this.logUploadResume('session-state-sync-skip', {
                longJobUuid: session.longJobUuid,
                rootSessionId: (session as any).rootSessionId,
                longJobState,
                status: session.status,
                retryStatus: (session as any).retryStatus,
                reason: 'failed-longjob-orchestrating'
              })
              return
            }
          }

          terminalLongJobUuids.add(session.longJobUuid)
          this.logUploadResume('session-state-sync', {
            longJobUuid: session.longJobUuid,
            rootSessionId: (session as any).rootSessionId,
            longJobState,
            fromStatus: session.status,
            nextStatus: terminalStatus,
            reason: 'terminal-longjob'
          })
          await session.update({
            status: terminalStatus,
            errorReason: this.getTerminalLongJobReason(session.longJobUuid, terminalStatus),
            lastOpDate: now
          })
          return
        }

        if (this.isSuspendedLongJob(longJobState) && session.status === 'UPLOADING') {
          this.logUploadResume('session-state-sync', {
            longJobUuid: session.longJobUuid,
            rootSessionId: (session as any).rootSessionId,
            longJobState,
            fromStatus: session.status,
            nextStatus: 'WAITING_FOR_FILE',
            retryStatus: 'WAITING_FOR_FILE',
            reason: 'suspended-longjob'
          })
          await session.update({
            status: 'WAITING_FOR_FILE',
            retryStatus: 'WAITING_FOR_FILE',
            lastOpDate: now
          })
        }
      })
    )

    return terminalLongJobUuids
  }

  private isSuspendedLongJob(longJobState?: string): boolean {
    if (!longJobState) {
      return false
    }
    return SUSPENDED_LONG_JOB_STATUSES.includes(longJobState.toUpperCase())
  }

  private canWaitForFileCheck(session: ZsResumableUploadSession): boolean {
    const status = (session as any).status as UploadSessionStatus
    if (!FAILED_LONG_JOB_FILE_CHECK_STATUSES.includes(status)) {
      return false
    }
    const retryCount = this.toFiniteNumber((session as any).retryCount, 0)
    const maxRetryCount = this.toFiniteNumber(
      (session as any).maxRetryCount,
      DEFAULT_MAX_RETRY_COUNT
    )
    return retryCount < maxRetryCount
  }

  private canRetryFailedLongJob(session: ZsResumableUploadSession, now: Date): boolean {
    if (this.canWaitForFileCheck(session)) {
      return true
    }
    if (
      (session as any).status !== 'WAITING_FOR_FILE' ||
      !this.hasFreshFileAvailability(session, now)
    ) {
      return false
    }
    const retryCount = this.toFiniteNumber((session as any).retryCount, 0)
    const maxRetryCount = this.toFiniteNumber(
      (session as any).maxRetryCount,
      DEFAULT_MAX_RETRY_COUNT
    )
    return retryCount < maxRetryCount
  }

  private isFailedLongJobRetryOrchestrationStatus(session: ZsResumableUploadSession): boolean {
    return FAILED_LONG_JOB_RETRY_ORCHESTRATION_STATUSES.includes(
      (session as any).status as UploadSessionStatus
    )
  }

  private buildFailedLongJobRetryPayload(
    session: ZsResumableUploadSession,
    longJob?: ZsLongJob
  ): UpdateUploadSessionPayload {
    const longJobData = this.normalizeJobData((longJob as any)?.data)
    return {
      status: 'WAITING_FOR_FILE_CHECK',
      retryStatus: 'WAITING_FOR_FILE_CHECK',
      retryCount: this.toFiniteNumber((session as any).retryCount, 0),
      maxRetryCount: this.toFiniteNumber((session as any).maxRetryCount, DEFAULT_MAX_RETRY_COUNT),
      nextRetryAt: null,
      fileAvailable: false,
      fileAvailableUntil: null,
      retryOwner: null,
      retryLockedUntil: null,
      jobName: (session as any).jobName ?? (longJob as any)?.jobName,
      jobData: (session as any).jobData ?? longJobData,
      resourceType: (session as any).resourceType ?? (longJob as any)?.resourceType,
      replacedFromLongJobUuid: (session as any).replacedFromLongJobUuid,
      previousLongJobUuid: (session as any).previousLongJobUuid ?? session.longJobUuid,
      rootSessionId: (session as any).rootSessionId ?? session.longJobUuid
    }
  }

  private buildRetryableLongJobPayload(
    session: ZsResumableUploadSession,
    longJob: ZsLongJob | undefined,
    now: Date,
    errorReason?: string
  ): UpdateUploadSessionPayload {
    const retryPayload = this.buildFailedLongJobRetryPayload(session, longJob)
    if (!this.hasFreshFileAvailability(session, now)) {
      return {
        ...retryPayload,
        errorReason
      }
    }

    const retryCount = this.toFiniteNumber((session as any).retryCount, 0)
    const nextRetryAt =
      this.resolveDate((session as any).nextRetryAt) ??
      new Date(now.getTime() + getUploadJobRetryDelayMs(retryCount))
    return {
      ...retryPayload,
      status: 'RETRY_WAITING',
      retryStatus: 'RETRY_WAITING',
      fileAvailable: true,
      fileAvailableUntil: this.getRetryFailureFileAvailableUntil(session, now, nextRetryAt),
      nextRetryAt,
      errorReason
    }
  }

  private hasFreshFileAvailability(session: ZsResumableUploadSession, now: Date): boolean {
    const fileAvailableUntil = this.resolveDate((session as any).fileAvailableUntil)
    return Boolean((session as any).fileAvailable && fileAvailableUntil && fileAvailableUntil > now)
  }

  private getTerminalStatus(longJobState?: string): UploadSessionStatus | undefined {
    if (!longJobState) {
      return undefined
    }
    return TERMINAL_LONG_JOB_STATUS_MAP[longJobState.toUpperCase()]
  }

  private getTerminalLongJobReason(
    longJobUuid: string,
    status: UploadSessionStatus
  ): string | undefined {
    if (status === 'COMPLETED') {
      return undefined
    }
    return `Long job ${longJobUuid} is ${status}; upload session cannot resume.`
  }

  private compactUpdatePayload(payload: UpdateUploadSessionPayload): UploadSessionUpdateData {
    const data: UploadSessionUpdateData = {
      lastOpDate: new Date()
    }

    if (typeof payload.offset === 'number' && Number.isFinite(payload.offset)) {
      data.offset = payload.offset
    }
    if (payload.status) {
      data.status = payload.status
    }
    if (payload.longJobUuid !== undefined) {
      data.longJobUuid = payload.longJobUuid
    }
    if (payload.uploadUrl !== undefined) {
      data.uploadUrl = payload.uploadUrl
    }
    if (payload.artifactUuid !== undefined) {
      data.artifactUuid = payload.artifactUuid
    }
    if (payload.errorReason !== undefined) {
      data.errorReason = payload.errorReason
    }
    if (payload.jobName !== undefined) {
      data.jobName = payload.jobName
    }
    if (payload.jobData !== undefined) {
      data.jobData = payload.jobData
    }
    if (payload.actionName !== undefined) {
      data.actionName = payload.actionName
    }
    if (payload.resourceType !== undefined) {
      data.resourceType = payload.resourceType
    }
    if (typeof payload.retryCount === 'number' && Number.isFinite(payload.retryCount)) {
      data.retryCount = payload.retryCount
    }
    if (typeof payload.maxRetryCount === 'number' && Number.isFinite(payload.maxRetryCount)) {
      data.maxRetryCount = payload.maxRetryCount
    }
    if (payload.retryStatus !== undefined) {
      data.retryStatus = payload.retryStatus
    }
    if (payload.fileAvailable !== undefined) {
      data.fileAvailable = payload.fileAvailable
    }
    if (payload.rootSessionId !== undefined) {
      data.rootSessionId = payload.rootSessionId
    }
    if (payload.replacedFromLongJobUuid !== undefined) {
      data.replacedFromLongJobUuid = payload.replacedFromLongJobUuid
    }
    if (payload.previousLongJobUuid !== undefined) {
      data.previousLongJobUuid = payload.previousLongJobUuid
    }
    if (payload.retryOwner !== undefined) {
      data.retryOwner = payload.retryOwner
    }
    this.assignNullableDate(data, 'nextRetryAt', payload.nextRetryAt)
    this.assignNullableDate(data, 'lastRetryAt', payload.lastRetryAt)
    this.assignNullableDate(data, 'fileAvailableUntil', payload.fileAvailableUntil)
    this.assignNullableDate(data, 'retryLockedUntil', payload.retryLockedUntil)
    const expiresAt = this.resolveDate(payload.expiresAt)
    if (expiresAt) {
      data.expiresAt = expiresAt
    }
    return data
  }

  private resolveDate(value?: string | Date): Date | undefined {
    if (!value) {
      return undefined
    }
    const date = value instanceof Date ? value : new Date(value)
    return Number.isNaN(date.getTime()) ? undefined : date
  }

  private resolveNullableDate(value?: string | Date | null): Date | null | undefined {
    if (value === null) {
      return null
    }
    return this.resolveDate(value)
  }

  private assignNullableDate<
    T extends keyof Pick<
      UploadSessionUpdateData,
      'nextRetryAt' | 'lastRetryAt' | 'fileAvailableUntil' | 'retryLockedUntil'
    >
  >(data: UploadSessionUpdateData, key: T, value?: string | Date | null): void {
    const date = this.resolveNullableDate(value)
    if (date !== undefined) {
      data[key] = date as UploadSessionUpdateData[T]
    }
  }

  private normalizeJobData(value: unknown): string | undefined {
    if (!value) {
      return undefined
    }
    return typeof value === 'string' ? value : JSON.stringify(value)
  }

  private toFiniteNumber(value: unknown, fallback: number): number {
    const numberValue = Number(value)
    return Number.isFinite(numberValue) ? numberValue : fallback
  }

  private truncateLogValue(value?: string): string | undefined {
    return value ? value.slice(0, 500) : undefined
  }

  private logUploadResume(stage: string, payload: Record<string, unknown>): void {
    this.logger?.debugJson({
      type: 'uploadResume',
      stage,
      ...payload
    })
  }

  private toDto(row: ZsResumableUploadSession): UploadSessionDto {
    const raw = row.get({ plain: true }) as ZsResumableUploadSession & {
      status: UploadSessionStatus
      expiresAt?: Date
    }
    const expired = raw.expiresAt ? new Date(raw.expiresAt).getTime() <= Date.now() : false

    return {
      sessionId: raw.sessionId,
      userUuid: raw.userUuid,
      accountUuid: raw.accountUuid,
      uploadType: raw.uploadType as UploadSessionType,
      hash: raw.hash,
      fileName: raw.fileName,
      fileSize: raw.fileSize,
      lastModified: raw.lastModified,
      longJobUuid: raw.longJobUuid,
      artifactUuid: raw.artifactUuid,
      uploadUrl: raw.uploadUrl,
      offset: raw.offset ?? 0,
      status:
        expired && !TERMINAL_UPLOAD_SESSION_STATUSES.includes(raw.status) ? 'EXPIRED' : raw.status,
      errorReason: raw.errorReason,
      expiresAt: raw.expiresAt,
      createDate: raw.createDate,
      lastOpDate: raw.lastOpDate,
      jobName: raw.jobName,
      jobData: raw.jobData,
      actionName: raw.actionName,
      resourceType: raw.resourceType,
      retryCount: raw.retryCount ?? 0,
      maxRetryCount: raw.maxRetryCount ?? DEFAULT_MAX_RETRY_COUNT,
      nextRetryAt: raw.nextRetryAt,
      lastRetryAt: raw.lastRetryAt,
      retryStatus: raw.retryStatus,
      fileAvailable: raw.fileAvailable,
      fileAvailableUntil: raw.fileAvailableUntil,
      rootSessionId: raw.rootSessionId,
      replacedFromLongJobUuid: raw.replacedFromLongJobUuid,
      previousLongJobUuid: raw.previousLongJobUuid,
      retryOwner: raw.retryOwner,
      retryLockedUntil: raw.retryLockedUntil,
      resumable: RESUMABLE_UPLOAD_SESSION_STATUSES.includes(raw.status) && !expired
    }
  }
}
