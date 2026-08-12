import { Module } from '@nestjs/common'

import { AttachPrimaryStorageToClusterService } from './attach-primary-storage-to-cluster'
import { CreateActionHandlerService } from './create/action-handler.service'
import { AttachPrimaryStorageToClusterTaskService } from './create/attach-primary-storage-to-cluster-task'
import { CreateBlockPrimaryStorageService } from './create/block/create'
import { CreateCephPrimaryStorageService } from './create/ceph/create'
import { CreateCephPrimaryStorageTaskService } from './create/ceph/create-ceph-task.service'
// import { CreateCephPrimaryStorageService } from './create/ceph/create.service'
import { CreateCephTaskHandlerService } from './create/ceph/task-handle.service'
import { CreateExternalPrimaryStorageService } from './create/external-storage/create'
import { TestConnectExternalPrimaryStorageService } from './create/external-storage/test-connect'
import { CreateLocalStoragePrimaryStorageService } from './create/local-storage/create'
import { CreateLocalStoragePrimaryStorageTaskService } from './create/local-storage/create-local-storage-task.service'
// import { CreateLocalStoragePrimaryStorageService } from './create/local-storage/create.service'
import { CreateLocalTaskHandlerService } from './create/local-storage/task-handle.service'
// import { CreateNFSPrimaryStorageService } from './create/nfs/create.service'
import { CreateNFSPrimaryStorageService } from './create/nfs/create'
import { CreateNFSPrimaryStorageTaskService } from './create/nfs/create-nfs-task.service'
import { CreateNFSTaskHandlerService } from './create/nfs/task-handle.service'
import { CreateSharedBlockGroupPrimaryStorageService } from './create/shared-block-group/create'
import { CreateSharedBlockGroupPrimaryStorageTaskService } from './create/shared-block-group/create-shared-block-group-task.service'
// import { CreateSharedBlockGroupPrimaryStorageService } from './create/shared-block-group/create.service'
import { CreateSharedBlockGroupTaskHandlerService } from './create/shared-block-group/task-handle.service'
import { CreateSharedMountPointPrimaryStorageTaskService } from './create/shared-mount-point/create-shared-mount-point-task.service'
import { CreateSharedMountPointPrimaryStorageService } from './create/shared-mount-point/create.service'
import { CreateSharedMountPointTaskHandlerService } from './create/shared-mount-point/task-handle.service'
import { DeletePrimaryStorageService } from './delete-primary-storage'
import { DetachPrimaryStorageFromClusterService } from './detach-primary-storage-from-cluster'
import { DisablePrimaryStorageService } from './disable-primary-storage'
import { EnablePrimaryStorageService } from './enable-primary-storage'
import { MaintainPrimaryStorageService } from './maintain-primary-storage'
import { ReconnectPrimaryStorageService } from './reconnect-primary-storage'
import { TakeoverPrimaryStorageService } from './takeover-primary-storage'
import { UpdatePSSystemTagService } from './update-cold-migrate-network'
import { UpdatePrimaryStorageService } from './update-primary-storage'
import { UpdatePrimaryStorageCephxService } from './update-primary-storage-cephx'
import { UpdatePrimaryStorageThinProvisionService } from './update-primary-storage-thin-provision'
import { UpdateCephTokenService } from './update-storage-ceph-token'
import { UpdateStorageNetworkCidrService } from './update-storage-network-cidr'

@Module({
  providers: [
    EnablePrimaryStorageService,
    DisablePrimaryStorageService,
    DeletePrimaryStorageService,
    UpdatePrimaryStorageService,
    ReconnectPrimaryStorageService,
    AttachPrimaryStorageToClusterService,
    DetachPrimaryStorageFromClusterService,
    MaintainPrimaryStorageService,
    UpdateStorageNetworkCidrService,
    UpdatePrimaryStorageThinProvisionService,
    UpdatePrimaryStorageCephxService,
    AttachPrimaryStorageToClusterTaskService,
    CreateActionHandlerService,
    CreateLocalTaskHandlerService,
    CreateLocalStoragePrimaryStorageTaskService,
    CreateLocalStoragePrimaryStorageService,
    CreateNFSPrimaryStorageService,
    CreateNFSTaskHandlerService,
    CreateNFSPrimaryStorageTaskService,
    CreateSharedMountPointPrimaryStorageService,
    CreateSharedMountPointTaskHandlerService,
    CreateSharedMountPointPrimaryStorageTaskService,
    CreateCephPrimaryStorageService,
    CreateCephTaskHandlerService,
    CreateCephPrimaryStorageTaskService,
    CreateSharedBlockGroupTaskHandlerService,
    CreateSharedBlockGroupPrimaryStorageTaskService,
    CreateSharedBlockGroupPrimaryStorageService,
    CreateBlockPrimaryStorageService,
    CreateExternalPrimaryStorageService,
    TestConnectExternalPrimaryStorageService,
    UpdateCephTokenService,
    UpdatePSSystemTagService,
    TakeoverPrimaryStorageService
  ],
  exports: []
})
export class PrimaryStorageActionModule {}
