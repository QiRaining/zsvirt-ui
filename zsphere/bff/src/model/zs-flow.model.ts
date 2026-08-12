import { BIGINT, STRING, TEXT, ENUM, DATE } from 'sequelize'
import { Column, Model, Table } from 'sequelize-typescript'

@Table({
  tableName: 'zs_flow'
})
export class ZsFlow extends Model<ZsFlow> {
  @Column({ type: BIGINT, primaryKey: true, field: 'id' })
  declare id: number

  @Column({ type: STRING(32), field: 'main_job_id' })
  mainJobId: string

  @Column({ type: TEXT({ length: 'medium' }) })
  get flow(): string {
    const value = this.getDataValue('flow')
    if (value != undefined) {
      return JSON.parse(value)
    }
  }

  set flow(value: string) {
    this.setDataValue('flow', JSON.stringify(value))
  }

  @Column(
    ENUM(
      'READY',
      'RUNNING',
      'FINISHED',
      'STOPPING',
      'STOPPED',
      'ABORTED',
      'CANCELED',
      'ROLLINGBACK',
      'ROLLEDBACK'
    )
  )
  state: string

  @Column({ type: DATE, field: 'create_date' })
  createDate: Date

  @Column({ type: DATE, field: 'last_op_date' })
  lastOpDate: Date
}
