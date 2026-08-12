import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { PciDeviceSpecResolver } from './pci-device-spec.resolver'
import { PciDeviceSpecService } from './pci-device-spec.service'

@Module({
  imports: [
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    OwnerModule
  ],
  providers: [PciDeviceSpecResolver, PciDeviceSpecService],
  exports: [PciDeviceSpecService]
})
export class PciDeviceSpecModule {}
