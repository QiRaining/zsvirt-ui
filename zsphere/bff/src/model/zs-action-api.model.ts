import { BIGINT, STRING, ENUM, DATE, TEXT } from 'sequelize'
import { Column, Model, Table, HasOne } from 'sequelize-typescript'

import { ZsLongJob } from './zs-long-job.model'

@Table({
  tableName: 'zs_action_api'
})
export class ZsActionApi extends Model<ZsActionApi> {
  @Column({ type: BIGINT, primaryKey: true, field: 'id' })
  declare id: number

  @Column({ type: STRING(32), field: 'api_id' })
  apiId: string

  @Column({ type: STRING(32), field: 'task_id' })
  taskId: string

  @Column({ type: STRING(32), field: 'action_id' })
  actionId: string

  @Column
  name: string

  @Column({ type: TEXT, field: 'resources' })
  resources: string

  @Column({ type: TEXT({ length: 'medium' }) })
  get req(): string {
    const value = this.getDataValue('req')
    if (value != undefined) {
      return JSON.parse(value)
    }
  }

  set req(value: string) {
    this.setDataValue('req', JSON.stringify(value))
  }

  @Column({ type: TEXT({ length: 'medium' }) })
  get resp(): string {
    const value = this.getDataValue('resp')
    if (value != undefined) {
      return JSON.parse(value)
    }
  }

  set resp(value: string) {
    this.setDataValue('resp', JSON.stringify(value))
  }

  @Column({ type: TEXT({ length: 'medium' }), field: 'signed_text' })
  signedText: string

  @HasOne(() => ZsLongJob, {
    foreignKey: 'clientJobUuid',
    sourceKey: 'apiId',
    as: 'longjob'
  })
  longjob: ZsLongJob

  @Column(ENUM('Success', 'Failed', 'Canceled', 'Canceling', 'Suspended', 'Unknown', 'Running'))
  status: string

  @Column({ type: DATE, field: 'create_date' })
  createDate: Date

  @Column({ type: DATE, field: 'last_op_date' })
  lastOpDate: Date
}
