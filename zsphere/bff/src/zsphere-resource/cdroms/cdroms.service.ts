import { Inject, Injectable } from '@nestjs/common'

import { Op, QueryParam } from '@/api/zstack/base/query-base'
import { DeleteVmCdRomAction } from '@/api/zstack/DeleteVmCdRomAction'
import { QueryGlobalConfigAction } from '@/api/zstack/QueryGlobalConfigAction'
import { QueryImageAction } from '@/api/zstack/QueryImageAction'
import { QueryVmCdRomAction } from '@/api/zstack/QueryVmCdRomAction'
import { SetVmInstanceDefaultCdRomAction } from '@/api/zstack/SetVmInstanceDefaultCdRomAction'
import { VmCdRomInventory } from '@/api/zstack/types'
import { UpdateVmCdRomAction } from '@/api/zstack/UpdateVmCdRomAction'
import { ActionService } from '@/base/action-service'

import { CdRomsQueryResp } from './cdroms.model'

@Injectable()
export class CdRomsService extends ActionService {
  @Inject() queryVmCdRomAction: QueryVmCdRomAction
  @Inject() deleteVmCdRomAction: DeleteVmCdRomAction
  @Inject() updateVmCdRomAction: UpdateVmCdRomAction
  @Inject() setVmInstanceDefaultCdRomAction: SetVmInstanceDefaultCdRomAction
  @Inject() queryImageAction: QueryImageAction
  @Inject() queryGlobalConfigAction: QueryGlobalConfigAction

  async query(params: QueryParam): Promise<CdRomsQueryResp> {
    const { inventories, total } = await this.queryVmCdRomAction.call(params)
    return {
      list: inventories,
      total
    }
  }

  async maxAmount(vmInstanceUuid: string): Promise<boolean> {
    const params: QueryParam = {
      conditions: [{ key: 'vmInstance.uuid', value: vmInstanceUuid }]
    }
    const { inventories } = await this.queryVmCdRomAction.call(params)
    const r = await this.queryMaxCdRom()
    return inventories.length < r.value
  }

  async queryByUuid(uuid: string): Promise<VmCdRomInventory> {
    const params: QueryParam = {
      conditions: [{ key: 'uuid', value: uuid }]
    }

    const { inventories } = await this.queryVmCdRomAction.call(params)

    return inventories[0] ?? null
  }

  async queryIsoName(uuid: string): Promise<string> {
    if (!uuid) {
      return null
    }
    const params: QueryParam = {
      conditions: [{ key: 'uuid', value: uuid }]
    }

    const { inventories } = await this.queryImageAction.call(params)

    return inventories[0]?.name ?? null
  }

  async queryMaxCdRom() {
    const { inventories } = await this.queryGlobalConfigAction.call({
      conditions: [
        { key: 'category', op: Op.eq, value: 'vm' },
        { key: 'name', op: Op.eq, value: 'maximumCdRomNum' }
      ]
    })
    return inventories[0]
  }
}
