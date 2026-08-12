import { Inject } from '@nestjs/common'
import { Args, Query } from '@nestjs/graphql'

import { TaskProgressList, QueryTaskProgressArgs } from './task-progress.model'
import { TaskProgressQueryService } from './task-progress.service'

export class TaskProgressQueryResolver {
  @Inject() taskProgressQueryService: TaskProgressQueryService

  @Query(() => TaskProgressList)
  async taskProgress(@Args() queryArgs: QueryTaskProgressArgs) {
    return await this.taskProgressQueryService.getTaskProgress(queryArgs)
  }
}
