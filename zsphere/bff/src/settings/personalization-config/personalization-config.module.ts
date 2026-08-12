import { Module } from '@nestjs/common'

import { PersonalizationConfigActionModule } from './action/_module'
import { PersonalizationConfigResolver } from './personalization-config.resolver'
import { PersonalizationConfigService } from './personalization-config.service'

@Module({
  imports: [PersonalizationConfigActionModule],
  providers: [PersonalizationConfigResolver, PersonalizationConfigService]
})
export class PersonalizationConfigModule {}
