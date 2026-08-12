import { Module } from '@nestjs/common'

import { CubeModule } from '@/cube/cube.module'

import { ApplyDRSAdviceService } from './apply-drs-advice'
import { AttachL2NetworksToClusterService } from './attach-l2-network-from-cluster'
import { CreateClusterService } from './create'
import { CreateClusterDRSService } from './create-cluster-drs'
import { DeleteClusterService } from './delete'
import { DetachL2NetworksFromClusterService } from './detach-l2-network-from-cluster'
import { DisableClusterService } from './disable'
import { EnableClusterService } from './enable'
import { ExecuteDRSSchedulingService } from './execute-drs-scheduling'
import { ModifyClusterConfigService } from './modify-cluster-config'
import { UpdateClusterService } from './update'
import { UpdateClusterDRSService } from './update-cluster-drs'
import { UpdateClusterDRSStateService } from './update-cluster-drs-state'

@Module({
  imports: [CubeModule],
  providers: [
    AttachL2NetworksToClusterService,
    DetachL2NetworksFromClusterService,
    CreateClusterService,
    EnableClusterService,
    DisableClusterService,
    DeleteClusterService,
    UpdateClusterService,
    CreateClusterDRSService,
    UpdateClusterDRSService,
    ExecuteDRSSchedulingService,
    ApplyDRSAdviceService,
    ModifyClusterConfigService,
    UpdateClusterDRSStateService
  ],
  exports: []
})
export class ClusterActionModule {}
