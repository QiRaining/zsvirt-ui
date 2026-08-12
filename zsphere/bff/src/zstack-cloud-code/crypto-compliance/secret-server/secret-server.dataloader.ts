import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import { reduce as _reduce } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import ZQL, { ZOp } from '@/common/zql/index'

import { SecurityMachineType } from '../security-machine/security-machine.model'

@Injectable()
export class SecretServerDataloader {
  @Inject() private readonly zqlService: ZQLService

  private secretServerDataloader

  private secretServerMap: any = {}

  constructor() {
    this.secretServerDataloader = new DataLoader(this._query)
  }

  query(uuid, secretServerUuid) {
    this.secretServerMap[uuid] = {
      uuid,
      secretServerUuid
    }
    return this.secretServerDataloader.load(uuid)
  }

  private readonly _query = async (uuids: string[]) => {
    const secretServerUuids = uuids.map(uuid => this.secretServerMap[uuid].secretServerUuid)

    const zql = ZQL.stringify({
      tableName: 'SecretResourcePool',
      condition: {
        uuid: {
          [ZOp.in]: secretServerUuids
        },
        type: {
          [ZOp.eq]: SecurityMachineType.CloudSecurityResourceService
        }
      }
    })

    const { results } = await this.zqlService.call(zql)
    const inventories = results[0]?.inventories ?? []

    const secretServerMap = _reduce(
      inventories,
      (obj, secretResourcePool) => {
        if (!obj[secretResourcePool.uuid]) {
          obj[secretResourcePool.uuid] = secretResourcePool
        }
        return obj
      },
      {}
    )

    return secretServerUuids.map(uuid => secretServerMap[uuid])
  }
}
