import { Inject, Injectable } from '@nestjs/common'
import { Resolver, Query, Args, Parent, ResolveField } from '@nestjs/graphql'

import {
  InspectionItem,
  InspectionItemTree,
  InspectionResource,
  InspectionSubTaskHealthState,
  InspectionTask,
  CrontabInspection,
  InspectionTaskOutputResp,
  QueryInsepctionArgs
} from './inspection.model'
import { InspectionService } from './inspection.service'

@Injectable()
@Resolver()
export class InspectionResolver {
  @Inject() inspectionService: InspectionService

  @Query(() => [InspectionItemTree])
  async inspectionItemTree() {
    return this.inspectionService.queryInspectionItemTree()
  }

  @Query(() => InspectionTask)
  async inspectionTask(@Args('taskUuid') taskUuid: string) {
    const result = await this.inspectionService.queryInspectionTask(taskUuid)
    return result
  }

  @Query(() => InspectionTaskOutputResp)
  async inspectionTaskOutput(@Args() args: QueryInsepctionArgs) {
    const result = await this.inspectionService.queryInspectionTaskOutput(args)
    return result
  }

  @Query(() => [InspectionTask])
  async inspectionTaskList(@Args() args: QueryInsepctionArgs) {
    const result = await this.inspectionService.queryInspectionTaskList(args)
    return result
  }

  @Query(() => InspectionTask, { nullable: true })
  async latestInspectionTask() {
    const list = await this.inspectionService.queryInspectionTaskList({})
    const latestTask = list.length > 0 ? list[0] : null
    if (latestTask) {
      if (latestTask.readStatus === 'READ' || latestTask.state === 'INIT') {
        return null
      }
    }
    return latestTask
  }

  @Query(() => InspectionResource)
  async inspectionResource() {
    const result = await this.inspectionService.queryInspectionResource()
    return result
  }

  // 最后一次巡检任务和定时任务整合。自动巡检使用这个查询
  @Query(() => CrontabInspection)
  async crontabInspection() {
    const result = await this.inspectionService.queryCrontabInspection()
    return result
  }
}

@Resolver(() => InspectionItem)
export class InspectionItemResolver {
  @ResolveField(() => Boolean)
  async hasCritical(@Parent() task: InspectionItem) {
    return task.originOutput.some(
      item => item.healthState === InspectionSubTaskHealthState.CRITICAL
    )
  }

  @ResolveField(() => Boolean)
  async hasWarn(@Parent() task: InspectionItem) {
    return task.originOutput.some(item => item.healthState === InspectionSubTaskHealthState.WARN)
  }
}
