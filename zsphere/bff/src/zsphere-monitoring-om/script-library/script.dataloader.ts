import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { ZQLService } from '@/api/zstack/base/zql-query'
import ZQL, { ZOp } from '@/common/zql/index'

@Injectable()
export class ScriptDataloader {
  @Inject() zqlService: ZQLService
  private scriptDataLoader

  private scriptMap: any = {}

  constructor() {
    this.scriptDataLoader = new DataLoader(this._query)
  }

  query(uuid, scriptUuid) {
    this.scriptMap[uuid] = {
      uuid,
      scriptUuid
    }
    return this.scriptDataLoader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const scriptUuids = uuids.map(uuid => this.scriptMap[uuid].scriptUuid)
    const zqlObj = {
      tableName: 'GuestVmScript',
      condition: {
        uuid: {
          [ZOp.in]: scriptUuids
        }
      }
    }
    const {
      results: [{ inventories }]
    } = await this.zqlService.call(ZQL.stringify(zqlObj))
    return uuids.map(uuid => {
      const scriptObj = inventories.find(script => script.uuid === this.scriptMap[uuid].scriptUuid)
      if (scriptObj) {
        return scriptObj
      } else {
        return null
      }
    })
  }
}
