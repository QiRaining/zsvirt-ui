import { Module } from '@nestjs/common'

import { PlatformCryptoCmplModule } from './platform-crypto-cmpl/platform-crypto-cmpl.module'
import { SecretResourcePoolModule } from './secret-resource-pool/secret-resource-pool.module'
import { SecretServerModule } from './secret-server/secret-server.module'
import { SecurityMachineModule } from './security-machine/security-machine.module'

@Module({
  imports: [
    SecretResourcePoolModule,
    SecurityMachineModule,
    PlatformCryptoCmplModule,
    SecretServerModule
  ],
  providers: []
})
export class CryptoComplianceModule {}
