import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Int, Mutation } from '@nestjs/graphql'

import { CleanUpBaremetalChassisBondingAction } from '@/api/zstack/CleanUpBaremetalChassisBondingAction'
import { CreateBaremetalBondingAction } from '@/api/zstack/CreateBaremetalBondingAction'
import { CreateBaremetalInstanceAction } from '@/api/zstack/CreateBaremetalInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class CreateBaremetalInstanceNicConfig {
  @Field(() => String)
  mac: string

  @Field(() => String)
  l3NetworkUuid: string

  @Field(() => String, { nullable: true })
  ip?: string
}

@InputType()
class CreateBaremetalInstanceBondConfig {
  @Field(() => String)
  name: string

  @Field(() => Int)
  mode: number

  @Field(() => String)
  l3NetworkUuid: string

  @Field(() => [String])
  slaves: string[]

  @Field(() => String, { nullable: true })
  ip?: string
}

@InputType()
class CreateBaremetalInstanceCustomConfig {
  @Field(() => String)
  key: string

  @Field(() => String)
  value: string
}

@InputType()
class CreateBaremetalInstancePayload {
  @Field(() => String)
  resourceUuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  chassisUuid: string

  @Field(() => String)
  imageUuid: string

  @Field(() => String, { nullable: true })
  templateUuid?: string

  @Field(() => String, { nullable: true })
  platform?: string

  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => String)
  password: string

  @Field(() => [CreateBaremetalInstanceNicConfig], { nullable: true })
  nicCfgs?: CreateBaremetalInstanceNicConfig[]

  @Field(() => [CreateBaremetalInstanceBondConfig], { nullable: true })
  bondingCfgs?: CreateBaremetalInstanceBondConfig[]

  @Field(() => [CreateBaremetalInstanceCustomConfig], { nullable: true })
  customConfigurations?: CreateBaremetalInstanceCustomConfig[]

  @Field(() => String, { nullable: true })
  strategy?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]
}

@InputType()
class CreateBaremetalInstanceInput {
  @Field(() => [CreateBaremetalInstancePayload])
  payload: CreateBaremetalInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateBaremetalInstanceService extends ActionService {
  @Inject()
  createBaremetalInstanceAction: CreateBaremetalInstanceAction
  @Inject()
  createBaremetalBondingAction: CreateBaremetalBondingAction
  @Inject()
  cleanUpBaremetalChassisBondingAction: CleanUpBaremetalChassisBondingAction

  @Mutation(() => ActionResult)
  createBaremetalInstance(@Args('input') input: CreateBaremetalInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BaremetalInstance',
      async (payload: CreateBaremetalInstancePayload, taskId: string) => {
        const {
          resourceUuid,
          name,
          description,
          chassisUuid,
          imageUuid,
          templateUuid,
          username,
          password,
          nicCfgs,
          bondingCfgs,
          platform,
          customConfigurations,
          systemTags = []
        } = payload
        const bondingMap: any = {}
        if (bondingCfgs.length) {
          await this.cleanUpBaremetalChassisBondingAction.call(
            {
              chassisUuid
            },
            { actionId, taskId }
          )
          await Promise.all(
            bondingCfgs.map((item: CreateBaremetalInstanceBondConfig) => {
              return this.createBaremetalBondingAction
                .call(
                  {
                    chassisUuid,
                    mode: item.mode,
                    slaves: item.slaves.join(),
                    name: item.name
                  },
                  { actionId, taskId }
                )
                .then(resp => {
                  bondingMap[resp.inventory.uuid] = item.l3NetworkUuid
                })
            })
          )
        }
        const customConfigurationsObject = {}
        customConfigurations.forEach((item: CreateBaremetalInstanceCustomConfig) => {
          customConfigurationsObject[item.key] = item.value
        })
        const _nicCfgs = {}
        nicCfgs.forEach(nic => {
          _nicCfgs[nic.mac] = nic.l3NetworkUuid
          if (nic.ip) {
            systemTags.push(`staticIp::${nic.l3NetworkUuid}::${nic.ip}`)
          }
        })
        bondingCfgs.forEach(bond => {
          if (bond.ip) {
            systemTags.push(`staticIp::${bond.l3NetworkUuid}::${bond.ip}`)
          }
        })
        await this.createBaremetalInstanceAction.call(
          {
            resourceUuid,
            name,
            description,
            chassisUuid,
            imageUuid,
            templateUuid,
            username,
            password,
            platform,
            nicCfgs: _nicCfgs,
            bondingCfgs: bondingCfgs.length ? bondingMap : [],
            customConfigurations: customConfigurationsObject,
            systemTags
          },
          { actionId, taskId }
        )

        return {
          id: actionId
        }
      }
    )
    return { actionId }
  }
}
