import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Float } from '@nestjs/graphql'
import * as _ from 'lodash'

import { DeleteVolumeQosAction } from '@/api/zstack/DeleteVolumeQosAction'
import { SetVolumeQosAction } from '@/api/zstack/SetVolumeQosAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SetVolumeQosPayload {
  @Field(() => String)
  uuid: string

  @Field(() => Float, { nullable: true })
  readBandwidth?: number

  @Field(() => Float, { nullable: true })
  writeBandwidth?: number

  @Field(() => Float, { nullable: true })
  totalBandwidth?: number

  @Field(() => Float, { nullable: true })
  readIOPS?: number

  @Field(() => Float, { nullable: true })
  writeIOPS?: number

  @Field(() => Float, { nullable: true })
  totalIOPS?: number
}

@InputType()
export class SetVolumeQosInput {
  @Field(() => [SetVolumeQosPayload])
  payload: SetVolumeQosPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVolumeQosService extends ActionService {
  @Inject() setVolumeQosAction: SetVolumeQosAction
  @Inject() deleteVolumeQosAction: DeleteVolumeQosAction
  @Mutation(() => ActionResult)
  setVolumeQos(@Args('input') input: SetVolumeQosInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Volume', async (payload: SetVolumeQosPayload, taskId: string) => {
      return await this.actionFn(payload, taskId, actionId)
    })
    return { actionId }
  }

  async actionFn(payload: SetVolumeQosPayload, taskId: string, actionId: string) {
    const { uuid, readBandwidth, writeBandwidth, totalBandwidth, readIOPS, writeIOPS, totalIOPS } =
      payload

    if (
      readBandwidth == -1 &&
      writeBandwidth == -1 &&
      totalBandwidth == -1 &&
      readIOPS == -1 &&
      writeIOPS == -1 &&
      totalIOPS == -1
    ) {
      await this.deleteVolumeQosAction.call({ uuid, mode: 'overwrite' }, { actionId, taskId })
    } else {
      const params = {
        readBandwidth: payload.readBandwidth,
        writeBandwidth: payload.writeBandwidth,
        totalBandwidth: payload.totalBandwidth,
        readIOPS: payload.readIOPS,
        writeIOPS: payload.writeIOPS,
        totalIOPS: payload.totalIOPS
      }
      for (const key in params) {
        if (params[key] === -1 || !params[key]) {
          delete params[key]
        }
      }
      if (_.keys(params)?.length) {
        await this.setVolumeQosAction.call({ uuid, ...params }, { actionId, taskId })
      }
    }
    return {
      id: uuid,
      fields: `bandwidth { readBandwidth, writeBandwidth, totalBandwidth, readIOPS, writeIOPS, totalIOPS }`,
      inventory: {
        bandwidth: {
          readBandwidth: payload.readBandwidth || -1,
          writeBandwidth: payload.writeBandwidth || -1,
          totalBandwidth: payload.totalBandwidth || -1,
          readIOPS: payload.readIOPS || -1,
          writeIOPS: payload.writeIOPS || -1,
          totalIOPS: payload.totalIOPS || -1
        }
      }
    }
  }
}
