import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

import { CubeModule } from '@/cube/cube.module'

import { LicenseActionModule } from './action/_module'
import { GetLicenseAddonService } from './get-license-addon/get-license-addon.service'
import { GetLicenseInfoService } from './get-license-info/get-license-info.service'
import { GetUSBKeyStatusService } from './get-usbkey-status/get-usbkey-status.service'
import { LicenseResolver } from './license.resolver'
import { LicenseService } from './license.service'

@Module({
  imports: [LicenseActionModule, HttpModule, CubeModule],
  providers: [
    GetLicenseInfoService,
    GetLicenseAddonService,
    GetUSBKeyStatusService,
    LicenseService,
    LicenseResolver
  ],
  exports: [LicenseService]
})
export class LicenseModule {}
