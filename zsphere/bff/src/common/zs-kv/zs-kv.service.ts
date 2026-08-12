import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { ZsKv } from '@/model/zs-kv.model'

@Injectable()
export class ZsKvService {
  @InjectModel(ZsKv) private zsKv: typeof ZsKv

  async query(key: string) {
    try {
      const target = await this.zsKv.findOne({
        where: { key: key }
      })
      if (target && target?.value) {
        return target
      } else {
        return null
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async update(key: string, value: string) {
    try {
      await this.zsKv.update({ value: value }, { where: { key: key } })
      return {
        key,
        value
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }
}
