import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import { isEmpty as _isEmpty, reduce as _reduce } from 'lodash'

import { AttachL2NetworkToClusterAction } from '@/api/zstack/AttachL2NetworkToClusterAction'
import { Op } from '@/api/zstack/base/query-base'
import { ActionInfo } from '@/api/zstack/base/types'
import {
  CreateL2HardwareVxlanNetworkAction,
  CreateL2HardwareVxlanNetworkActionParam
} from '@/api/zstack/CreateL2HardwareVxlanNetworkAction'
import {
  CreateL2NoVlanNetworkAction,
  CreateL2NoVlanNetworkActionParam
} from '@/api/zstack/CreateL2NoVlanNetworkAction'
import {
  CreateL2VirtualSwitchAction,
  CreateL2VirtualSwitchActionParam
} from '@/api/zstack/CreateL2VirtualSwitchAction'
import {
  CreateL2VlanNetworkAction,
  CreateL2VlanNetworkActionParam
} from '@/api/zstack/CreateL2VlanNetworkAction'
import {
  CreateL2VxlanNetworkAction,
  CreateL2VxlanNetworkActionParam
} from '@/api/zstack/CreateL2VxlanNetworkAction'
import { CreateL2VxlanNetworkPoolAction } from '@/api/zstack/CreateL2VxlanNetworkPoolAction'
import { CreateVniRangeAction } from '@/api/zstack/CreateVniRangeAction'
import { QueryHostAction } from '@/api/zstack/QueryHostAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { CreateBondService } from '@/hardware-resource/bond/action/create'
import { CreateL3NetworkActionService } from '@/network-resource/l3-network/action/create-l3-network'

import {
  AttachL2NetworkToClusterHostParams,
  CreateL2NetworkInput,
  L2Network,
  l2NetworkType
} from '../l2.network.model'

@InputType()
export class CreateL2NetworkActionInput {
  @Field(() => CreateL2NetworkInput)
  payload: CreateL2NetworkInput

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateL2NetworkService extends ActionService {
  @Inject() createL2NoVlanNetworkAction: CreateL2NoVlanNetworkAction
  @Inject() createL2VlanNetworkAction: CreateL2VlanNetworkAction
  @Inject() createL2VxlanNetworkAction: CreateL2VxlanNetworkAction
  @Inject()
  createL2HardwareVxlanNetworkAction: CreateL2HardwareVxlanNetworkAction
  @Inject() createVniRangeAction: CreateVniRangeAction
  @Inject() createL2VxlanNetworkPoolAction: CreateL2VxlanNetworkPoolAction
  @Inject() attachL2NetworkToClusterAction: AttachL2NetworkToClusterAction
  @Inject() createL3NetworkActionService: CreateL3NetworkActionService
  @Inject() createL2VirtualSwitchAction: CreateL2VirtualSwitchAction
  @Inject() createBondService: CreateBondService
  @Inject() queryHostAction: QueryHostAction

  @Mutation(() => ActionResult)
  createL2Network(@Args('input') input: CreateL2NetworkActionInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'L2Network',
      async (payload: CreateL2NetworkInput, taskId: string) => {
        const { inventory } = (await this._createL2Network(payload, {
          actionId,
          taskId
        })) as any
        return {
          id: inventory?.uuid,
          inventory
        }
      },
      { bundle: true }
    )
    return { actionId }
  }

  _createL2Network = async (params: CreateL2NetworkInput, actionInfo: ActionInfo) => {
    const {
      type,
      clusterUuid,
      clusterUuids,
      l3netowrkParam,
      createBondPayloads,
      attachL2NetworkToClusterHostParams: _attachL2NetworkToClusterHostParams,
      ..._params
    } = params

    let attachL2NetworkToClusterHostParams: AttachL2NetworkToClusterHostParams[] | undefined =
      _attachL2NetworkToClusterHostParams

    if (createBondPayloads?.length) {
      try {
        await Promise.all(
          createBondPayloads
            .map(async createBondPayload => {
              if (createBondPayload?.hostUuids?.length) {
                return this.createBondService.actionFn(
                  createBondPayload,
                  actionInfo.taskId,
                  actionInfo.actionId
                )
              } else {
                return this.queryHostAction
                  .call({
                    conditions: [
                      {
                        key: 'clusterUuid',
                        op: Op.in,
                        values: clusterUuids
                      }
                    ]
                  })
                  .then(hostResp => {
                    const hosts = hostResp?.inventories || []

                    if (createBondPayloads[0]?.slaveNames?.length > 1) {
                      return this.createBondService.actionFn(
                        {
                          ...createBondPayload,
                          hostUuids: hosts.map(it => it.uuid)
                        },
                        actionInfo.taskId,
                        actionInfo.actionId
                      )
                    }

                    const physicalInterface = createBondPayloads[0]?.slaveNames?.[0]

                    attachL2NetworkToClusterHostParams = _reduce(
                      hosts,
                      (obj, curr, index) => {
                        if (!obj[curr.clusterUuid]) {
                          obj[curr.clusterUuid] = [{ hostUuid: curr.uuid, physicalInterface }]
                        } else {
                          obj[curr.clusterUuid].push({
                            hostUuid: curr.uuid,
                            physicalInterface
                          })
                        }

                        if (index === hosts.length - 1) {
                          return Object.entries(obj).map(([clusterUuid, hostParams]) => ({
                            clusterUuid,
                            hostParams: JSON.stringify(hostParams)
                          }))
                        }

                        return obj
                      },
                      {} as any
                    )
                  })
              }
            })
            .filter(Boolean)
        )
      } catch (e) {
        console.log(e)
      }
    }

    let resp
    switch (type) {
      case l2NetworkType.L2NoVlanNetwork:
        resp = await this.createL2NoVlanNetworkAction.call(
          _params as CreateL2NoVlanNetworkActionParam,
          actionInfo
        )
        break
      case l2NetworkType.L2VlanNetwork:
        resp = await this.createL2VlanNetworkAction.call(
          _params as CreateL2VlanNetworkActionParam,
          actionInfo
        )
        break
      case l2NetworkType.VxlanNetwork:
        return await this.createL2VxlanNetworkAction.call(
          _params as CreateL2VxlanNetworkActionParam,
          actionInfo
        )
      case l2NetworkType.HardwareVxlanNetwork:
        return await this.createL2HardwareVxlanNetworkAction.call(
          _params as CreateL2HardwareVxlanNetworkActionParam,
          actionInfo
        )
      case l2NetworkType.VirtualSwitch:
        resp = await this.createL2VirtualSwitchAction.call(
          _params as CreateL2VirtualSwitchActionParam,
          actionInfo
        )
        break
      case l2NetworkType.VxlanNetwork:
      case l2NetworkType.HardwareVxlanNetwork:
        break
    }

    const attachL2NetworkToClusterHostParamsMap = _reduce(
      attachL2NetworkToClusterHostParams,
      (obj, curr) => {
        if (!obj[curr.clusterUuid]) {
          obj[curr.clusterUuid] = curr.hostParams
        }

        return obj
      },
      {} as any
    )

    if (
      !_isEmpty(clusterUuids) &&
      type !== l2NetworkType.VxlanNetwork &&
      type !== l2NetworkType.HardwareVxlanNetwork
    ) {
      await Promise.all(
        clusterUuids.map(clusterUuid =>
          this.attachL2NetworkToClusterAction.call(
            {
              l2NetworkUuid: resp.inventory.uuid,
              clusterUuid,
              hostParams: attachL2NetworkToClusterHostParamsMap[clusterUuid]
            },
            actionInfo
          )
        )
      )
    }

    if (l3netowrkParam) {
      await this.createL3NetworkActionService.create(
        { ...l3netowrkParam, l2NetworkUuid: resp.inventory.uuid },
        actionInfo
      )
    }

    return resp
  }
}
