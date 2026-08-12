import { BIGINT, DATE, DECIMAL, ENUM, STRING, TEXT } from 'sequelize'
import { Column, Model, Table } from 'sequelize-typescript'

@Table({
  tableName: 'zops_long_job'
})
export class ZopsLongJob extends Model<ZopsLongJob> {
  @Column({ type: BIGINT, primaryKey: true, field: 'id' })
  declare id: number

  @Column({ type: STRING(32), field: 'long_job_uuid' })
  longJobUuid: string

  @Column({ type: STRING(32), field: 'client_job_uuid' })
  clientJobUuid: string

  @Column({ type: STRING(128), field: 'job_name' })
  jobName: string

  @Column({ type: STRING(128), field: 'resource_type' })
  resourceType: string

  @Column({ type: TEXT({ length: 'medium' }) })
  get data(): string {
    const value = this.getDataValue('data')
    if (value != undefined) {
      return JSON.parse(value)
    }
  }

  set data(value: string) {
    this.setDataValue('data', JSON.stringify(value))
  }

  @Column({ type: DECIMAL, field: 'progress' })
  progress: number

  @Column(ENUM('INIT', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELED', 'SUSPENDED'))
  state: string

  @Column({ type: STRING(32), field: 'user_id' })
  userId: string

  @Column({ type: DATE, field: 'create_date' })
  createDate: Date

  @Column({ type: DATE, field: 'last_op_date' })
  lastOpDate: Date

  @Column({ type: STRING(32), field: 'read_status' })
  readStatus: string
}
