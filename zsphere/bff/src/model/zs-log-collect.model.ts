import { STRING, ENUM, DATE } from 'sequelize'
import { Column, Model, Table } from 'sequelize-typescript'

@Table({
  tableName: 'zs_log_collect'
})
export class ZsLogCollect extends Model<ZsLogCollect> {
  @Column({ type: STRING(64), field: 'uuid', primaryKey: true })
  uuid: string

  @Column({ type: STRING(128), field: 'type' })
  type: string

  @Column({ type: STRING(256), field: 'name' })
  name: string

  @Column({ type: STRING(64), field: 'host' })
  host: string

  @Column(ENUM('RUNNING', 'SUCCESS', 'FAILED'))
  state: string

  @Column({ type: STRING(512), field: 'url' })
  url: string

  @Column({ type: DATE, field: 'start_time' })
  startTime: Date

  @Column({ type: DATE, field: 'end_time' })
  endTime: Date

  @Column({ type: DATE, field: 'create_date' })
  createDate: Date

  @Column({ type: DATE, field: 'last_op_date' })
  lastOpDate: Date
}
