import { Injectable } from '@nestjs/common'

import { SimpleDataloaderFactory } from '@/common/resource.dataloader'
import { ZOp } from '@/common/zql'
import {
  SchedulerJob,
  SchedulerJobState
} from '@/zsphere-administration/scheduler-job/scheduler-job.model'

@Injectable()
export class SnapshotSchedulerJobDataloader extends SimpleDataloaderFactory<SchedulerJob>({
  tableName: 'schedulerJob',
  result: 'inventories',
  getCondition: uuid => ({
    targetResourceUuid: uuid,
    jobClassName: 'org.zstack.scheduler.snapshot.CreateVolumeSnapshotGroupJob',
    state: SchedulerJobState.Enabled,
    schedulerJobGroupUuids: {
      [ZOp.notIn]: ['']
    }
  })
}) {}
