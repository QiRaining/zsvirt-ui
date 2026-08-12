import { Inject } from '@nestjs/common'
import { Resolver, Mutation, Subscription, Args } from '@nestjs/graphql'

import { ActionResp } from '@/common/model/action-resp.model'
import { PubSubServiceBase } from '@/common/pub-sub/pub-sub-base.service'

import { CreateExportTaskArgs, ExportTaskExportPayload } from './data-export.model'
import { DataExportService } from './data-export.service'
@Resolver()
export class DataExportResolver {
  @Inject()
  private dataExportService: DataExportService

  @Inject() private pubSubService: PubSubServiceBase

  @Mutation(() => ActionResp)
  async createExportTask(@Args() args: CreateExportTaskArgs): Promise<ActionResp> {
    return this.dataExportService.createExportTask(args)
  }

  // @Query(() => ExportTask)
  // async getExportTaskStatus(
  //   @Args('taskId') taskId: string
  // ): Promise<ExportTask> {
  //   return this.exportCsvService.getTaskStatus(taskId)
  // }
}
