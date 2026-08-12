import { STRING, TEXT } from 'sequelize'
import { Column, Model, Table } from 'sequelize-typescript'

@Table({
  tableName: 'zs_ui_config'
})
export class ZsUIConfig extends Model<ZsUIConfig> {
  @Column({ type: STRING(255), primaryKey: true, field: 'name' })
  name: string

  @Column({ type: TEXT, field: 'value' })
  value: string

  @Column({ type: TEXT, field: 'defaultValue' })
  defaultValue: string
}
