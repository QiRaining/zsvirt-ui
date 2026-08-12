import { Module } from '@nestjs/common'

import { UpdateHostIdentifierService } from './update-host-identifier'

@Module({ providers: [UpdateHostIdentifierService] })
export class StorageAdapterActionModule {}
