import { BIGINT, STRING, ENUM, DATE, INTEGER } from 'sequelize'
import { Column, Model, Table, HasMany } from 'sequelize-typescript'

import { ZsActionTask } from './zs-action-task.model'
import { ZsLongJob } from './zs-long-job.model'

@Table({
  tableName: 'zs_action'
})
export class ZsAction extends Model<ZsAction> {
  @Column({ type: BIGINT, primaryKey: true, field: 'id' })
  declare id: number

  @Column({ type: STRING(32), field: 'action_id' })
  actionId: string

  @Column
  key: string

  @Column
  name: string

  @Column({ type: STRING(1024), field: 'user_name' })
  userName: string

  @Column({ type: STRING(1024), field: 'resource_uuids' })
  resourceUuids: string

  @Column({ type: STRING(32), field: 'login_ip' })
  loginIp: string

  @Column(
    ENUM(
      'Running',
      'Success',
      'Failed',
      'Exception',
      'Canceled',
      'Canceling',
      'Timeout',
      'Suspended',
      'Unknown'
    )
  )
  status: string

  @Column({ type: STRING(32), field: 'user_id' })
  userId: string

  @Column({ type: DATE, field: 'create_date' })
  createDate: Date

  @Column({ type: DATE, field: 'last_op_date' })
  lastOpDate: Date

  @Column({ type: STRING(32), field: 'account_uuid', allowNull: true })
  accountId?: string

  @Column({ type: INTEGER, field: 'progress' })
  progress: number

  @HasMany(() => ZsActionTask, {
    foreignKey: 'actionId',
    sourceKey: 'actionId',
    as: 'operationTasks'
  })
  operationTasks: ZsActionTask[]

  @HasMany(() => ZsLongJob, {
    foreignKey: 'clientJobUuid',
    sourceKey: 'actionId',
    as: 'longjobs'
  })
  longjobs: ZsLongJob[]
}
