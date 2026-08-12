import { BIGINT, STRING, TEXT, DATE, INTEGER } from 'sequelize'
import { Column, Model, Table } from 'sequelize-typescript'

@Table({
  tableName: 'zs_role_privilege'
})
export class ZsRolePrivilege extends Model<ZsRolePrivilege> {
  @Column({ type: BIGINT, primaryKey: true, field: 'id' })
  declare id: number

  @Column({ type: STRING(32), field: 'uuid' })
  uuid: string

  @Column({ type: STRING(32), field: 'role_uuid' })
  roleUuid: string

  @Column({ type: STRING(32), field: 'system_role_uuid' })
  systemRoleUuid: string

  @Column({ type: TEXT({ length: 'medium' }), field: 'privilege' })
  get privilege(): string {
    const value = this.getDataValue('privilege')
    if (value != undefined) {
      return JSON.parse(value)
    }
  }

  set privilege(value: string) {
    this.setDataValue('privilege', JSON.stringify(value))
  }

  @Column({ type: INTEGER(), field: 'version' })
  declare version: number

  @Column({ type: TEXT({ length: 'medium' }), field: 'signed_text' })
  signedText: string

  @Column({ type: DATE, field: 'create_date' })
  createDate: Date

  @Column({ type: DATE, field: 'last_op_date' })
  lastOpDate: Date
}
