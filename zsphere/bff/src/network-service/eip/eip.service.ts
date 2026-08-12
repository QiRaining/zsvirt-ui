import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import { AttachEipAction } from '@/api/zstack/AttachEipAction'
import { conditionsToObject } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { CreateEipAction } from '@/api/zstack/CreateEipAction'
import { DeleteEipAction } from '@/api/zstack/DeleteEipAction'
import { DeleteVipAction } from '@/api/zstack/DeleteVipAction'
import { DetachEipAction } from '@/api/zstack/DetachEipAction'
import { GetResourceAccountAction } from '@/api/zstack/GetResourceAccountAction'
import { QueryEipAction } from '@/api/zstack/QueryEipAction'
import { UpdateEipAction } from '@/api/zstack/UpdateEipAction'
import { ActionService } from '@/base/action-service'
import type { QueryAction } from '@/common/model/action-query.model'
import { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql'
import ZQL from '@/common/zql/index'
import type { ZqlObject } from '@/common/zql/zqlBuilder'

import { EipQueryType } from './eip.model'

@Injectable()
export class EipService extends ActionService {
  @Inject() queryEipAction: QueryEipAction
  @Inject() deleteEipAction: DeleteEipAction
  @Inject() attachEipAction: AttachEipAction
  @Inject() detachEipAction: DetachEipAction
  @Inject() updateEipAction: UpdateEipAction
  @Inject() createEipAction: CreateEipAction
  @Inject() deleteVipAction: DeleteVipAction
  @Inject() getResourceAccountAction: GetResourceAccountAction
  @Inject() zqlService: ZQLService

  private vmNicDataloader

  private vmNicMap = new Map()

  constructor() {
    super()
    this.vmNicDataloader = new DataLoader(this._getVmNic)
  }

  spliceFilterKeyCondition(
    queryAction: QueryAction,
    filterKey: string,
    getFilterCondition?: (conditon: any) => any
  ) {
    const { conditions } = queryAction

    const filterCondition = _.remove(
      conditions,
      ({ key }: { key: string }) => key === filterKey
    )?.[0]
    if (!filterCondition) {
      return null
    }
    return getFilterCondition?.(filterCondition)
  }

  getOwnerFilterCondition(conditon: any) {
    const { value } = conditon

    return QueryConditionTranslator.generateOwnerZqlConditon(value, 'EipVO')
  }

  getVmConditon(filterCondition: any) {
    if (filterCondition) {
      const { values = [], value } = filterCondition

      const hadService = values?.find(v => v === 'HadBind')
      const notHadService = values?.find(v => v === 'NotBind')

      if (hadService && notHadService) {
        return null
      }

      if (notHadService) {
        return {
          vmNicUuid: {
            [ZOp.is]: null
          }
        }
      }

      if (hadService) {
        return {
          vmNicUuid: {
            [ZOp.not]: null
          }
        }
      }

      if (value) {
        return {
          'vmNic.vmInstance.name': {
            [ZOp.like]: value
          }
        }
      }
    }

    return null
  }

  async query(params) {
    const conditions = []

    const ownerCondition = this.spliceFilterKeyCondition(
      params,
      'owner',
      this.getOwnerFilterCondition
    )

    const VmCondition = this.spliceFilterKeyCondition(
      params,
      'vmNic.vmInstance.name',
      this.getVmConditon
    )
    if (VmCondition) {
      conditions.push(VmCondition)
    }

    if (params?.type === EipQueryType.SelectEipByCreateVm) {
      conditions.push({ vmNicUuid: { [ZOp.is]: null } })
    }

    if (params?.type === EipQueryType.GetVmNicAttachableEips) {
      const conditionsMap = conditionsToObject(params?.extraConditions)
      const candidateKeys = ['vmNicUuid', 'ipVersion']
      const param = _.pick(conditionsMap, candidateKeys) as {
        vmNicUuid: string
        ipVersion: string | number | undefined
      }
      conditions.push({
        uuid: {
          [ZOp.in]: {
            [ZOp.getapi]: {
              action: ZQLAction.GET_API,
              api: 'GetVmNicAttachableEips',
              output: 'inventories.uuid',
              condition: {
                vmNicUuid: `${param?.vmNicUuid}`,
                ipVersion: param?.ipVersion ? Number(param?.ipVersion) : undefined
              }
            }
          }
        }
      })
    }

    if (ownerCondition) {
      conditions.push(ownerCondition)
    }

    const zqlObject: ZqlObject = {
      tableName: 'eip'
    }
    if (conditions.length > 0) {
      zqlObject.condition = {
        [ZOp.and]: [conditions]
      }
    }

    const {
      results: [{ inventories: list = [], total = 0 } = {}]
    } = await this.zqlService.call(
      ZQL.stringify(QueryConditionTranslator.mergeQueryAction(params, zqlObject))
    )

    return {
      list,
      total
    }
  }

  getVmNic(uuid, vmNicUuid) {
    this.vmNicMap.set(uuid, vmNicUuid)
    return this.vmNicDataloader.load(uuid)
  }

  _getVmNic = async (uuids: string[]) => {
    const vmNicUuids = _.uniq([...this.vmNicMap.values()])
    const zql = ZQL.multStringify([
      {
        tableName: 'vminstance',
        condition: {
          'vmNics.uuid': {
            [ZOp.in]: vmNicUuids
          }
        }
      },
      {
        tableName: 'BareMetal2Instance',
        condition: {
          'vmNics.uuid': {
            [ZOp.in]: vmNicUuids
          }
        }
      }
    ])

    const res = await this.zqlService.call(zql)
    const {
      results: [
        { inventories: vmInventories = [] } = {},
        { inventories: bm2InstanceInventories = [] } = {}
      ]
    } = res
    const inventories = vmInventories.concat(bm2InstanceInventories)
    const vmNicMap = this.vmNicMap
    const vms = uuids.map(uuid => {
      const vmNicUuid = vmNicMap.get(uuid)
      const vm = inventories.find(v => {
        const { vmNics } = v
        return vmNics?.find(f => f.uuid === vmNicUuid)
      })
      return vm ?? null
    })
    return vms
  }
}
