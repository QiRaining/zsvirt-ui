import { BIGINT, DATE, STRING } from 'sequelize'
import { Column, Model, Table } from 'sequelize-typescript'

@Table({
  tableName: 'zs_session'
})
export class ZsSession extends Model<ZsSession> {
  @Column({ type: BIGINT, primaryKey: true, field: 'id' })
  declare id: number

  @Column({ type: STRING(32), field: 'sessionId' })
  sessionId: string

  /**
   * Legacy compatibility column. Account sessions no longer have a separate
   * user UUID; new records persist accountUuid here until the DB column is migrated away.
   */
  @Column({ type: STRING(32), field: 'uid' })
  userId: string

  @Column({ type: STRING(32), field: 'accountUuid' })
  accountId: string

  @Column({ type: STRING(32), field: 'identity' })
  identity: string

  // @Column({ type: ENUM( 'Acount','VirtualID','User' ), field: 'type' })
  @Column
  type: string

  @Column({ type: DATE, field: 'create_date' })
  createDate: Date
}
