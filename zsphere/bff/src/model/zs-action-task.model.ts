import { BIGINT, STRING, ENUM, DATE } from 'sequelize'
import { Column, HasMany, Model, Table } from 'sequelize-typescript'

import { ZsActionApi } from './zs-action-api.model'

@Table({
  tableName: 'zs_action_task'
})
export class ZsActionTask extends Model<ZsActionTask> {
  @Column({ type: BIGINT, primaryKey: true, field: 'id' })
  declare id: number

  @Column({ type: STRING(32), field: 'task_id' })
  taskId: string

  @Column({ type: STRING(32), field: 'action_id' })
  actionId: string

  @Column(ENUM('Success', 'Failed', 'Exception', 'Canceled', 'Canceling', 'Suspended', 'Unknown'))
  status: string

  @Column({ type: DATE, field: 'create_date' })
  createDate: Date

  @Column({ type: DATE, field: 'last_op_date' })
  lastOpDate: Date

  @HasMany(() => ZsActionApi, {
    foreignKey: 'taskId',
    sourceKey: 'taskId',
    as: 'operationApis'
  })
  operationApis: ZsActionApi[]
}
