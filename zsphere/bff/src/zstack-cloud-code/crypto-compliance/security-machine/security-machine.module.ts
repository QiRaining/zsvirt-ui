import { Module } from '@nestjs/common'

import { SecretResourcePoolModule } from '../secret-resource-pool/secret-resource-pool.module'
import { SecurityMachineQueryService } from './query/security-machine.query.service'
import { SecurityMachineDataloader } from './security-machine.dataloader'
import { SecretResourceResolver } from './security-machine.resolver'

@Module({
  imports: [SecretResourcePoolModule],
  providers: [SecretResourceResolver, SecurityMachineQueryService, SecurityMachineDataloader],
  exports: [SecurityMachineDataloader, SecurityMachineQueryService]
})
export class SecurityMachineModule {}
