import { Field, Float, ObjectType } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'
import { VmInstance } from '@/zsphere-resource/vm-instance/vm-instance.model'
import { Volume } from '@/zsphere-resource/volume/model/volume.model'

@ObjectType()
export class SystemSchedulingTask {
  @Field(() => VmInstance, { nullable: true })
  vmInstance: VmInstance

  @Field(() => Volume, { nullable: true })
  volume: Volume

  @Field(() => Float, { nullable: true })
  progress: number

  @Field(() => String, { nullable: true })
  apiId: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => Float, { nullable: true })
  executeTime: number

  @Field(() => String, { nullable: true })
  jobData: string

  @Field(() => String, { nullable: true })
  jobName: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => String, { nullable: true })
  jobResult: string

  @Field(() => String, { nullable: true })
  managementNodeUuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  state: string

  @Field(() => String, { nullable: true })
  targetResourceUuid: string

  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  createDate: string
}

@ObjectType()
export class SystemSchedulingTaskResp extends QueryCommonResponse(SystemSchedulingTask) {}
