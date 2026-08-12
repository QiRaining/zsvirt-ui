import { Injectable, Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import { pick as _pick } from 'lodash'

import { ActionService } from '@/base/action-service'
import { ActionHandlerService } from '@/common/flow/flow-handler/action-handler.service'
import { serial, parallel } from '@/common/flow/flow-instance/flow-instance-chain'
import { ActionResult, ActionInput } from '@/common/model/action.model'
import { genUuid } from '@/utils'

import { CreateL3NetworkInputParam } from '../../l3-network.model'
import { AddDnsTaskService, AddDnsTaskParam } from './add-dns-task.service'
import { AddIpRangeTaskService, AddIpRangeTaskParam } from './add-ip-range-task.service'
import {
  AttachNetworkServiceToL3NetworkTaskService,
  AttachNetworkServiceToL3NetworkParam
} from './attach-network-service-to-l3-network-task.service'
import { AttachVpcRouterTaskParam, AttachVpcRouterTaskService } from './attach-vpc-router'
import {
  AttachVirtualRouterOfferingTaskService,
  AttachVirtualRouterOfferingTaskParam
} from './attach-vrouter-offering.service'
import { CreateL3NetworkTaskService, CreateL3NetworkTaskParam } from './create-task.service'
import {
  SetL3NetworkRouterInterfaceIpTaskParam,
  SetInterfaceIpTaskService
} from './set-interface-ip-task.service'
import { CreateL3NetworkTaskHandlerService } from './task-handle.service'

@InputType()
class CreateL3NetworkInput {
  @Field(() => CreateL3NetworkInputParam)
  payload: CreateL3NetworkInputParam

  @Field(() => ActionInput)
  action: ActionInput
}

@Injectable()
export class CreateL3NetworkActionService extends ActionService {
  @Inject() private createL3NetworkTaskService: CreateL3NetworkTaskService
  @Inject()
  private attachNetworkServiceToL3NetworkTaskService: AttachNetworkServiceToL3NetworkTaskService
  @Inject() private addIpRangeTaskService: AddIpRangeTaskService
  @Inject() private addDnsTaskService: AddDnsTaskService
  @Inject() private setInterfaceIpTaskService: SetInterfaceIpTaskService
  @Inject() private attachVpcRouterTaskService: AttachVpcRouterTaskService
  @Inject() private actionHandlerService: ActionHandlerService
  @Inject()
  private createL3NetworkTaskHandlerService: CreateL3NetworkTaskHandlerService
  @Inject()
  private attachVirtualRouterOfferingTaskService: AttachVirtualRouterOfferingTaskService

  @Mutation(() => ActionResult)
  async createL3Network(
    @Args('input')
    input: CreateL3NetworkInput
  ) {
    const actionId = input.action.actionId
    const {
      createL3NetworkParam,
      addDnsParam,
      addIpRangeParam,
      attachVirtualRouterOfferingParam,
      attachNetworkServiceToL3NetworkParam,
      setInterfaceIpParam,
      attachVpcRouterParam
    } = this.buildL3NetworkParams(input.payload)

    this.recordActionService.recordActionStart(input.payload, actionId, input.action.name)

    const taskId = genUuid()
    const info = {
      actionId: input.action.actionId,
      taskId
    }
    this.recordActionService.recordTaskStart(taskId, actionId)

    const genInput = param => {
      return {
        param,
        info
      }
    }

    const parallelList = [
      {
        service: AddIpRangeTaskService.name,
        input: genInput(addIpRangeParam)
      }
    ] as any[]

    if (addDnsParam.dns) {
      parallelList.push({
        service: AddDnsTaskService.name,
        input: genInput(addDnsParam)
      })
    }

    if (attachVirtualRouterOfferingParam.virtualRouterOfferingUuid) {
      parallelList.push({
        service: AttachVirtualRouterOfferingTaskService.name,
        input: genInput(attachVirtualRouterOfferingParam)
      })
    }

    // 先创建三层网络，如果不是系统网络则挂载网络对应的网络服务。
    // 然后执行添加网络段，dns，挂载路由器规格等操作
    // 添加网络段之后 再执行设置接口IP和挂载vpc路由器等操作
    const serialList: any[] = [
      {
        service: CreateL3NetworkTaskService.name,
        input: genInput(createL3NetworkParam)
      }
    ]
    if (!createL3NetworkParam.system) {
      serialList.push({
        service: AttachNetworkServiceToL3NetworkTaskService.name,
        input: genInput(attachNetworkServiceToL3NetworkParam)
      })
    }
    serialList.push(parallel(parallelList))

    const step2ParallelList = []
    if (setInterfaceIpParam.routerInterfaceIp) {
      step2ParallelList.push({
        service: SetInterfaceIpTaskService.name,
        input: genInput(setInterfaceIpParam)
      })
    }

    if (attachVpcRouterParam.vmInstanceUuid) {
      step2ParallelList.push({
        service: AttachVpcRouterTaskService.name,
        input: genInput(attachVpcRouterParam)
      })
    }

    if (step2ParallelList.length) {
      serialList.push(step2ParallelList)
    }

    const flow = parallel([serial(serialList, { info })], {
      info,
      onSubTaskFinished: CreateL3NetworkTaskHandlerService.name,
      onAllFinished: ActionHandlerService.name
    })

    this.flowManagerService.initServices({
      [CreateL3NetworkTaskService.name]: this.createL3NetworkTaskService,
      [AttachNetworkServiceToL3NetworkTaskService.name]:
        this.attachNetworkServiceToL3NetworkTaskService,
      [AddIpRangeTaskService.name]: this.addIpRangeTaskService,
      [AddDnsTaskService.name]: this.addDnsTaskService,
      [AttachVpcRouterTaskService.name]: this.attachVpcRouterTaskService,
      [AttachVirtualRouterOfferingTaskService.name]: this.attachVirtualRouterOfferingTaskService,
      [SetInterfaceIpTaskService.name]: this.setInterfaceIpTaskService,
      [CreateL3NetworkTaskHandlerService.name]: this.createL3NetworkTaskHandlerService,
      [ActionHandlerService.name]: this.actionHandlerService
    })

    this.flowManagerService.run(flow, actionId, { allowAbort: true }).catch(error => {
      this.recordActionService.recordActionFailed(actionId)
      console.log(error)
    })

    return { actionId }
  }

  buildL3NetworkParams(actionParam: CreateL3NetworkInputParam) {
    const addDnsParam = {
      dns: actionParam.dns ?? (actionParam.ipVersion === 4 ? '223.5.5.5' : '240c::6666')
    } as AddDnsTaskParam

    const setInterfaceIpParam = _pick(actionParam, [
      'routerInterfaceIp'
    ]) as SetL3NetworkRouterInterfaceIpTaskParam

    const attachVpcRouterParam = {
      vmInstanceUuid: actionParam.vpcVRouterUuid
    } as AttachVpcRouterTaskParam

    const addIpRangeParam = _pick(actionParam, [
      'name',
      'ipVersion',
      'startIp',
      'endIp',
      'ipRangeType',
      'gateway',
      'addressMode',
      'prefixLen',
      'netmask',
      'dhcpIp',
      'networkCidr'
    ]) as Partial<AddIpRangeTaskParam>

    const attachVirtualRouterOfferingParam = _pick(actionParam, [
      'virtualRouterOfferingUuid'
    ]) as AttachVirtualRouterOfferingTaskParam

    const attachNetworkServiceToL3NetworkParam = _pick(actionParam, [
      'ipVersion',
      'showNetworkServiceType',
      'dhcpService'
    ]) as AttachNetworkServiceToL3NetworkParam

    const createL3NetworkParam = _pick(actionParam, [
      'name',
      'description',
      'type',
      'l2NetworkUuid',
      'category',
      'ipVersion',
      'dnsDomain',
      'resourceUuid',
      'system',
      'systemTags',
      'userTags'
    ]) as CreateL3NetworkTaskParam

    return {
      addDnsParam,
      addIpRangeParam,
      attachVirtualRouterOfferingParam,
      attachNetworkServiceToL3NetworkParam,
      createL3NetworkParam,
      setInterfaceIpParam,
      attachVpcRouterParam
    }
  }
}
