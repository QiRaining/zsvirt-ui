import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { LongJobService } from '@/common/long-job/long-job.service'
import { BackupStorageModule } from '@/hardware-resource/backup-storage/backup-storage.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsLongJob } from '@/model/zs-long-job.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { ImageDataloader } from '@/zsphere-resource/image/image.dataloader'

import { ImageActionModule } from './action/_module'
import { AddImageService } from './create/add-image'
import LongJobExtend from './create/long-job-extend'
import { ImageUploadController } from './create/upload-image'
import { ImageQueryService } from './image-query/image-query.service'
import { ImageResolver, ImageSummaryResolver } from './image.resolver'

@Module({
  imports: [
    ZStackApiModule,
    ImageActionModule,
    OwnerModule,
    BackupStorageModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession, ZsLongJob])
  ],
  providers: [
    ImageResolver,
    ImageSummaryResolver,
    ImageQueryService,
    LongJobService,
    ImageDataloader,
    AddImageService,
    LongJobExtend
  ],
  controllers: [ImageUploadController],
  exports: [ImageDataloader]
})
export class ImageModule {}
