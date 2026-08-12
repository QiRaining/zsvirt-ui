import { Inject } from '@nestjs/common'
import { Resolver, Args, Query, ResolveField, Parent } from '@nestjs/graphql'

import { QueryGuestVmScriptExecutedRecordDetailService } from './query/vm-script-executed-record-detail.service'
import { QueryGuestVmScriptExecutedRecordService } from './query/vm-script-executed-record.service'
import { QueryGuestVmScriptService } from './query/vm-script.service'
import {
  Script,
  ScriptList,
  ScriptExecuteRecord,
  ScriptExecuteRecordList,
  ScriptExecuteRecordDetail,
  ScriptExecuteRecordDetailList,
  QueryGuestVmScriptExecutedRecordDetailArgs,
  QueryGuestVmScriptExecutedRecordArgs,
  QueryGuestVmScriptArgs
} from './script-library.model'
import { ScriptDataloader } from './script.dataloader'

@Resolver(() => Script)
export class ScriptLibraryResolver {
  @Inject() queryGuestVmScriptService: QueryGuestVmScriptService

  @Query(() => ScriptList)
  async scriptList(@Args() queryArgs: QueryGuestVmScriptArgs) {
    return this.queryGuestVmScriptService.queryList(queryArgs)
  }
}

@Resolver(() => ScriptExecuteRecord)
export class ScriptRecordResolver {
  @Inject()
  queryGuestVmScriptExecutedRecordService: QueryGuestVmScriptExecutedRecordService
  @Inject() scriptDataloader: ScriptDataloader

  @Query(() => ScriptExecuteRecordList)
  async scriptExecuteRecordList(@Args() queryArgs: QueryGuestVmScriptExecutedRecordArgs) {
    return this.queryGuestVmScriptExecutedRecordService.queryList(queryArgs)
  }

  @ResolveField()
  relatedScript(@Parent() record: ScriptExecuteRecord) {
    return this.scriptDataloader.query(record.uuid, record.scriptUuid)
  }
}

@Resolver(() => ScriptExecuteRecordDetail)
export class ScriptRecordDetailResolver {
  @Inject()
  queryGuestVmScriptExecutedRecordDetailService: QueryGuestVmScriptExecutedRecordDetailService

  @Query(() => ScriptExecuteRecordDetailList)
  async scriptExecuteRecordDetailList(
    @Args() queryArgs: QueryGuestVmScriptExecutedRecordDetailArgs
  ) {
    return this.queryGuestVmScriptExecutedRecordDetailService.queryList(queryArgs)
  }

  @ResolveField()
  vmInstance(@Parent() record: ScriptExecuteRecordDetail) {
    return this.queryGuestVmScriptExecutedRecordDetailService.getVmInstance(record.vmInstanceUuid)
  }
}
