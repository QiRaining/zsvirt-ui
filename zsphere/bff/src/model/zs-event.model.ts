import { BIGINT, BLOB, ENUM, DATE, INTEGER } from 'sequelize'
import { Column, Model, Table } from 'sequelize-typescript'

@Table({
  tableName: 'event'
})
export class ZsEvent extends Model<ZsEvent> {
  @Column({ type: BIGINT, primaryKey: true, field: 'id' })
  declare id: number

  @Column
  uuid: string

  @Column
  ip: string

  @Column
  title: string

  @Column({ type: BLOB })
  data: string

  @Column
  zone: string

  @Column
  creator: string

  @Column(ENUM('ACCOUNT', 'USER', 'LDAP', 'VIRTUALID'))
  creator_type: string

  @Column
  project_uuid: string

  @Column(ENUM('UNDONE', 'OK', 'ERR', 'MIX', 'CANCEL'))
  status: string

  @Column({ type: DATE })
  create_time: Date

  @Column({ type: DATE })
  update_time: Date

  @Column(ENUM('Y', 'N'))
  ack: string

  @Column({ type: INTEGER })
  retry: number
}
