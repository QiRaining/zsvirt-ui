import { Module } from '@nestjs/common'

import { CubeModule } from '@/cube/cube.module'

import { DeleteLicenseService } from './delete'

@Module({
  imports: [CubeModule],
  providers: [DeleteLicenseService]
})
export class LicenseActionModule {}
