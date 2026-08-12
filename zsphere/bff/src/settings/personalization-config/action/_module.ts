import { Module } from '@nestjs/common'

import { UpdatePersonalizationConfigService } from './update'

@Module({
  providers: [UpdatePersonalizationConfigService]
})
export class PersonalizationConfigActionModule {}
