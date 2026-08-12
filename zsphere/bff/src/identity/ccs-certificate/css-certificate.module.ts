import { Module } from '@nestjs/common'
import { CCSCertificateResolver } from './css-certificate.resolver'

@Module({
  imports: [],
  providers: [CCSCertificateResolver]
})
export class CCSCertificateModule {}
