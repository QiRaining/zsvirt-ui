import { BIGINT, DATE, STRING, TEXT } from 'sequelize'
import { Column, Model, Table } from 'sequelize-typescript'

@Table({
  tableName: 'zs_profile'
})
export class ZsProfile extends Model<ZsProfile> {
  @Column({ type: BIGINT, primaryKey: true, field: 'id' })
  declare id: number

  @Column({ type: STRING(32), field: 'user_id' })
  userId: string

  @Column({ type: STRING(32), field: 'identity' })
  identity: string

  @Column({ type: STRING(256), field: 'type' })
  type: string

  @Column({ type: TEXT, field: 'content' })
  get content(): string {
    const value = this.getDataValue('content') as unknown as string
    if (value !== undefined) {
      return JSON.parse(value)
    }
  }

  set content(value: string) {
    const contentValue = JSON.stringify(value) as unknown as string
    this.setDataValue('content', contentValue)
  }

  @Column({ type: DATE, field: 'create_date' })
  createDate: Date

  @Column({ type: DATE, field: 'last_op_date' })
  lastOpDate: Date
}
