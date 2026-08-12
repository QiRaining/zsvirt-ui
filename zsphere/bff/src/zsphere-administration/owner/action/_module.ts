import { Module } from '@nestjs/common'

import { OwnerDataLoader } from '../owner.dataloader'
import { OwnerService } from '../owner.service'
import { ChangeResourceOwnerService } from './change-resource-owner'
import { RevokeResourceSharingService } from './revoke-resource-sharing'
import { ShareResourceService } from './share-resource'
import { UpdateResourceSharingGroupService } from './update-resource-sharing-group'
import { ZsvRevokeResourceSharingService } from './zsv-revoke-resource-sharing'
import { ZsvShareResourceService } from './zsv-share-resource'
import { ZsvShareResourceFromAccountService } from './zsv-share-resource-from-account'

@Module({
  providers: [
    OwnerService,
    ChangeResourceOwnerService,
    RevokeResourceSharingService,
    ShareResourceService,
    UpdateResourceSharingGroupService,
    OwnerDataLoader,
    ZsvRevokeResourceSharingService,
    ZsvShareResourceService,
    ZsvShareResourceFromAccountService
  ],
  exports: []
})
export class OwnerActionModule {}
