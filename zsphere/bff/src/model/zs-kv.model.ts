import { BIGINT } from 'sequelize'
import { Column, Model, Table } from 'sequelize-typescript'

@Table({
  tableName: 'zs_kv'
})
export class ZsKv extends Model<ZsKv> {
  @Column({ type: BIGINT, primaryKey: true, field: 'id' })
  declare id: number

  @Column
  key: string

  @Column
  value: string
}
