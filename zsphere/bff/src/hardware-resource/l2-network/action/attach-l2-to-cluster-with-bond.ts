import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import { reduce as _reduce } from 'lodash'

import { AttachL2NetworkToClusterAction } from '@/api/zstack/AttachL2NetworkToClusterAction'
import { AttachL2NetworkToHostAction } from '@/api/zstack/AttachL2NetworkToHostAction'
import { Op } from '@/api/zstack/base/query-base'
import { CreateBondingAction } from '@/api/zstack/CreateBondingAction'
import { QueryHostAction } from '@/api/zstack/QueryHostAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { CreateBondPayload } from '@/hardware-resource/bond/action/create'
import { CreateBondService } from '@/hardware-resource/bond/action/create'

import { AttachL2NetworkToClusterHostParams } from '../l2.network.model'
import {
  UpdateVirtualSwitchUplinkBondingsActionPayload,
  UpdateVirtualSwitchUplinkBondingsService
} from './update-virtual-switch-uplink-bonding'

@InputType()
export class AttachL2NetworksToClusterWithBondPayload {
  @Field(() => [String])
  clusterUuids: string[]

  @Field(() => String)
  l2NetworkUuid: string

  @Field(() => [CreateBondPayload], { nullable: true })
  createBondPayloads?: CreateBondPayload[]

  @Field(() => UpdateVirtualSwitchUplinkBondingsActionPayload, {
    nullable: true
  })
  updateVirtualSwitchUplinkBondingsActionPayload?: UpdateVirtualSwitchUplinkBondingsActionPayload

  @Field(() => [AttachL2NetworkToClusterHostParams], {
    nullable: true,
    defaultValue: []
  })
  attachL2NetworkToClusterHostParams?: AttachL2NetworkToClusterHostParams[]

  @Field(() => [String], { nullable: true })
  hostUuids?: string[]
}

@InputType()
class AttachL2NetworksToClusterWithBondInput {
  @Field(() => AttachL2NetworksToClusterWithBondPayload)
  payload: AttachL2NetworksToClusterWithBondPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachL2NetworksToClusterWithBondService extends ActionService {
  @Inject() attachL2NetworkToClusterAction: AttachL2NetworkToClusterAction
  @Inject() createBondingAction: CreateBondingAction
  @Inject() queryHostAction: QueryHostAction
  @Inject() attachL2NetworkToHostAction: AttachL2NetworkToHostAction
  @Inject() createBondService: CreateBondService
  @Inject()
  updateVirtualSwitchUplinkBondingsService: UpdateVirtualSwitchUplinkBondingsService

  @Mutation(() => ActionResult)
  attachL2NetworkToClusterWithBond(@Args('input') input: AttachL2NetworksToClusterWithBondInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'L2Network',
      async (payload: AttachL2NetworksToClusterWithBondPayload, taskId: string) => {
        let attachL2NetworkToClusterHostParams: AttachL2NetworkToClusterHostParams[] | undefined =
          payload?.attachL2NetworkToClusterHostParams

        if (payload?.updateVirtualSwitchUplinkBondingsActionPayload) {
          await this.updateVirtualSwitchUplinkBondingsService.action(
            payload?.updateVirtualSwitchUplinkBondingsActionPayload,
            { actionId, taskId }
          )
        }

        if (payload?.createBondPayloads?.length) {
          await Promise.all(
            payload?.createBondPayloads.map(async createBondPayload => {
              if (createBondPayload?.hostUuids?.length) {
                return this.createBondService.actionFn(createBondPayload, taskId, actionId)
              } else {
                return this.queryHostAction
                  .call({
                    conditions: [
                      {
                        key: 'clusterUuid',
                        op: Op.in,
                        values: payload?.clusterUuids
                      }
                    ]
                  })
                  .then(hostResp => {
                    const hosts = hostResp?.inventories || []

                    if (payload?.createBondPayloads[0]?.slaveNames?.length > 1) {
                      return this.createBondService.actionFn(
                        {
                          ...createBondPayload,
                          hostUuids: hosts.map(it => it.uuid)
                        },
                        taskId,
                        actionId
                      )
                    }

                    const physicalInterface = payload?.createBondPayloads[0]?.slaveNames?.[0]

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
          )
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

        await Promise.all(
          payload.clusterUuids.map(
            async clusterUuid =>
              await this.attachL2NetworkToClusterAction.call(
                {
                  l2NetworkUuid: payload.l2NetworkUuid,
                  clusterUuid: clusterUuid,
                  hostParams: attachL2NetworkToClusterHostParamsMap[clusterUuid]
                },
                { actionId, taskId }
              )
          )
        )

        // if (payload?.hostUuids?.length) {
        //   await Promise.all(
        //     payload.hostUuids.map(
        //       async hostUuid =>
        //         await this.attachL2NetworkToHostAction.call(
        //           {
        //             l2NetworkUuid: payload.l2NetworkUuid,
        //             hostUuid: hostUuid
        //           },
        //           { actionId, taskId }
        //         )
        //     )
        //   )
        // }

        return {
          id: payload.l2NetworkUuid
        }
      }
    )
    return { actionId }
  }
}
