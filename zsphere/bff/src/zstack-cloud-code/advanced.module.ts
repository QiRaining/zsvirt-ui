import { Module } from '@nestjs/common'

import { CryptoComplianceModule } from './crypto-compliance/crypto-compliance.module'

@Module({
  imports: [CryptoComplianceModule],
  providers: []
})
export class AdvancedModule {}
