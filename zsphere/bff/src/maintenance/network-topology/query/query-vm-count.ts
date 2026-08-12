import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { ZQLService } from '@/api/zstack/base/zql-query'
import ZQL, { ZOp, ZQLAction } from '@/common/zql/index'

@Injectable()
export class VmCountInL3NetworkDataloader {
  @Inject() zqlService: ZQLService
  private vmCountInL3NetworkDataloader

  constructor() {
    this.vmCountInL3NetworkDataloader = new DataLoader(this._query)
  }

  query(uuid) {
    return this.vmCountInL3NetworkDataloader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const multVmZql = uuids.map(uuid => {
      return {
        tableName: 'VmInstance',
        action: ZQLAction.COUNT,
        condition: {
          ['vmNics.l3NetworkUuid']: uuid,
          type: {
            [ZOp.in]: ['UserVm', 'baremetal2']
          },
          state: {
            [ZOp.ne]: 'Destroyed'
          }
        },
        namedAs: uuid
      }
    })
    const zql = ZQL.multStringify(multVmZql)
    const { results } = await this.zqlService.call(zql)

    return uuids.map(uuid => {
      const vmCountInL3Network = results?.find(_hy => _hy.name === uuid)
      if (vmCountInL3Network && vmCountInL3Network?.total) {
        return vmCountInL3Network?.total
      } else {
        return null
      }
    })
  }
}
