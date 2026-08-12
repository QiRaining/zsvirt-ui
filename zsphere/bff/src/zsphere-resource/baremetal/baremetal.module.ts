import { Module } from '@nestjs/common'

import { BaremetalInstanceModule } from '@/zsphere-resource/baremetal/baremetal-instance/baremetal-instance.module'

import { BaremetalChassisModule } from './baremetal-chassis/baremetal-chassis.module'
import { BaremetalClusterModule } from './baremetal-cluster/baremetal-cluster.module'
import { BaremetalPxeServerModule } from './baremetal-pxe-server/baremetal-pxe-server.module'
import { PreconfigurationTemplateModule } from './preconfiguration-template/preconfiguration-template.module'

@Module({
  imports: [
    BaremetalChassisModule,
    BaremetalInstanceModule,
    PreconfigurationTemplateModule,
    BaremetalPxeServerModule,
    BaremetalClusterModule
  ],
  providers: []
})
export class BaremetalModule {}
