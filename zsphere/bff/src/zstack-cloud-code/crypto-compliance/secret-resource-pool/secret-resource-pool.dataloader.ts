import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import { reduce as _reduce } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import ZQL, { ZOp } from '@/common/zql/index'

import { SecurityMachineType } from '../security-machine/security-machine.model'

@Injectable()
export class SecretResourcePoolDataloader {
  @Inject() private readonly zqlService: ZQLService

  private secretResourcePoolDataloader

  private secretResourcePoolMap: any = {}

  constructor() {
    this.secretResourcePoolDataloader = new DataLoader(this._query)
  }

  query(uuid, secretResourcePoolUuid) {
    this.secretResourcePoolMap[uuid] = {
      uuid,
      secretResourcePoolUuid
    }
    return this.secretResourcePoolDataloader.load(uuid)
  }

  private readonly _query = async (uuids: string[]) => {
    const secretResourcePoolUuids = uuids.map(
      uuid => this.secretResourcePoolMap[uuid].secretResourcePoolUuid
    )

    const zql = ZQL.stringify({
      tableName: 'SecretResourcePool',
      condition: {
        uuid: {
          [ZOp.in]: secretResourcePoolUuids
        },
        type: {
          [ZOp.ne]: SecurityMachineType.CloudSecurityResourceService
        }
      }
    })

    const { results } = await this.zqlService.call(zql)
    const inventories = results[0]?.inventories ?? []

    const secretResourcePoolMap = _reduce(
      inventories,
      (obj, secretResourcePool) => {
        if (!obj[secretResourcePool.uuid]) {
          obj[secretResourcePool.uuid] = secretResourcePool
        }
        return obj
      },
      {}
    )

    return secretResourcePoolUuids.map(uuid => secretResourcePoolMap[uuid])
  }
}
