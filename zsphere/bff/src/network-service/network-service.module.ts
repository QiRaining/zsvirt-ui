import { Module } from '@nestjs/common'

import { EipModule } from './eip/eip.module'
import { PortMirrorSessionModule } from './port-mirror-session/port-mirror-session.module'
import { PortMirrorModule } from './port-mirror/port-mirror.module'
import { SecurityGroupModule } from './security-group/security-group.module'
import { SlbOfferingModule } from './slb-offering/slb-offering.module'
import { UsedIpModule } from './used-ip/used-ip.module'

@Module({
  imports: [
    PortMirrorModule,
    SlbOfferingModule,
    SecurityGroupModule,
    EipModule,
    PortMirrorSessionModule,
    UsedIpModule
  ],
  providers: []
})
export class NetworkServiceModule {}
