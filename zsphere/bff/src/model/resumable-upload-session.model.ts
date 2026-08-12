import { BIGINT, BOOLEAN, DATE, ENUM, INTEGER, STRING, TEXT } from 'sequelize'
import { BeforeCreate, Column, Model, Table } from 'sequelize-typescript'

import { genUuid } from '@/utils'

export const RESUMABLE_UPLOAD_SESSION_TABLE = 'zs_resumable_upload_session'

@Table({
  tableName: RESUMABLE_UPLOAD_SESSION_TABLE
})
export class ZsResumableUploadSession extends Model<ZsResumableUploadSession> {
  @BeforeCreate
  static ensureId(session: ZsResumableUploadSession): void {
    if (!session.id) {
      session.id = genUuid()
    }
  }

  @Column({ type: STRING(32), primaryKey: true, field: 'id' })
  declare id: string

  @Column({ type: STRING(64), field: 'session_id' })
  sessionId: string

  @Column({ type: STRING(32), field: 'user_uuid' })
  userUuid: string

  @Column({ type: STRING(32), field: 'account_uuid' })
  accountUuid: string

  @Column({
    type: ENUM('image', 'storagePackage', 'migrationServicePackage'),
    field: 'upload_type'
  })
  uploadType: string

  @Column({ type: STRING(128), field: 'hash' })
  hash: string

  @Column({ type: STRING(512), field: 'file_name' })
  fileName: string

  @Column({ type: BIGINT, field: 'file_size' })
  fileSize: number

  @Column({ type: BIGINT, field: 'last_modified' })
  lastModified: number

  @Column({ type: STRING(32), field: 'long_job_uuid' })
  longJobUuid: string

  @Column({ type: STRING(32), field: 'artifact_uuid' })
  artifactUuid: string

  @Column({ type: TEXT, field: 'upload_url' })
  uploadUrl: string

  @Column({ type: BIGINT, field: 'offset' })
  offset: number

  @Column({
    type: ENUM(
      'UPLOADING',
      'WAITING_FOR_FILE_CHECK',
      'RETRY_WAITING',
      'RETRYING',
      'RETRY_READY',
      'WAITING_FOR_FILE',
      'PAUSED',
      'COMPLETED',
      'FAILED',
      'CANCELED',
      'RETRY_EXHAUSTED',
      'EXPIRED'
    ),
    field: 'status'
  })
  status: string

  @Column({ type: TEXT, field: 'error_reason' })
  errorReason: string

  @Column({ type: STRING(128), field: 'job_name' })
  jobName: string

  @Column({ type: TEXT({ length: 'medium' }), field: 'job_data' })
  jobData: string

  @Column({ type: STRING(256), field: 'action_name' })
  actionName: string

  @Column({ type: STRING(128), field: 'resource_type' })
  resourceType: string

  @Column({ type: INTEGER, field: 'retry_count' })
  retryCount: number

  @Column({ type: INTEGER, field: 'max_retry_count' })
  maxRetryCount: number

  @Column({ type: DATE, field: 'next_retry_at' })
  nextRetryAt: Date

  @Column({ type: DATE, field: 'last_retry_at' })
  lastRetryAt: Date

  @Column({ type: STRING(64), field: 'retry_status' })
  retryStatus: string

  @Column({ type: BOOLEAN, field: 'file_available' })
  fileAvailable: boolean

  @Column({ type: DATE, field: 'file_available_until' })
  fileAvailableUntil: Date

  @Column({ type: STRING(64), field: 'root_session_id' })
  rootSessionId: string

  @Column({ type: STRING(32), field: 'replaced_from_long_job_uuid' })
  replacedFromLongJobUuid: string

  @Column({ type: STRING(32), field: 'previous_long_job_uuid' })
  previousLongJobUuid: string

  @Column({ type: STRING(128), field: 'retry_owner' })
  retryOwner: string

  @Column({ type: DATE, field: 'retry_locked_until' })
  retryLockedUntil: Date

  @Column({ type: DATE, field: 'expires_at' })
  expiresAt: Date

  @Column({ type: DATE, field: 'create_date' })
  createDate: Date

  @Column({ type: DATE, field: 'last_op_date' })
  lastOpDate: Date
}
