import { Module } from '@nestjs/common'

import { UpdateCustomColumnsService } from './update'

@Module({
  providers: [UpdateCustomColumnsService]
})
export class CustomColumnsActionModule {}
