import { Inject } from '@nestjs/common'
import { Resolver, Query, Args } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { QueryMdevDeviceAction } from '@/api/zstack/QueryMdevDeviceAction'
import { VolumeStatus } from '@/common/enum'
import { PciDeviceQueryService } from '@/hardware-resource/pci-device/pci-device-query/pci-device-query.service'
import { ScsiLunQueryService } from '@/hardware-resource/scsi-lun/scsi-lun-query/scsi-lun-query.service'
import { UsbDeviceService } from '@/hardware-resource/usb-device/usb.device.service'
import { VGpuDeviceService } from '@/hardware-resource/vgpu-device/vgpu-device.service'
import { VolumeQueryType } from '@/zsphere-resource/volume/model/volume.model'

import { CdRomsService } from '../cdroms/cdroms.service'
import { QueryVmNicService } from '../vm-nic/query/query.service'
import { VolumeQueryService } from '../volume/volume-query/volume-query.service'
import { VmRelatedResource, VmExternalDevice } from './related-resource.model'

@Resolver(() => VmRelatedResource)
export class VmRelatedResourceResolver {
  @Inject() volumeService: VolumeQueryService
  @Inject() nicService: QueryVmNicService
  @Inject() cdRomsService: CdRomsService
  @Inject() scsiLunQueryService: ScsiLunQueryService
  @Inject() usbService: UsbDeviceService
  @Inject() pciDeviceQueryService: PciDeviceQueryService
  @Inject() vGpuDeviceService: VGpuDeviceService
  @Inject() queryMdevDeviceAction: QueryMdevDeviceAction

  @Query(() => VmRelatedResource)
  async vmRelatedResource(@Args('uuid') uuid: string) {
    const countList: VmRelatedResource = {
      volume: 0,
      lastVolume: 0,
      nic: 0,
      cdrom: 0,
      lun: 0,
      usb: 0,
      gpu: 0,
      vgpu: 0,
      pci: 0,
      se: 0
    }
    const params = {
      conditions: [
        {
          key: 'vmInstance.uuid',
          op: Op.eq,
          value: uuid
        }
      ],
      count: true
    }
    await Promise.all([
      this.volumeService
        .queryList({
          type: VolumeQueryType.GET_VOLUME_BY_VMINSTANCE_UUID,
          extraConditions: [{ key: 'vmInstanceUuid', op: Op.eq, value: uuid }]
        })
        .then(
          resp => {
            countList.volume = resp.total
          },
          () => {
            countList.volume = 0
          }
        ),
      this.volumeService
        .queryList({
          conditions: [
            {
              key: 'lastVmInstanceUuid',
              op: Op.eq,
              value: uuid
            },
            {
              key: 'vmInstanceUuid',
              op: Op.is,
              value: null
            },
            {
              key: 'status',
              op: Op.ne,
              value: VolumeStatus.Deleted
            }
          ]
        })
        .then(
          resp => {
            countList.lastVolume = resp.total
          },
          () => {
            countList.lastVolume = 0
          }
        ),
      this.nicService.query(params, true).then(
        resp => {
          countList.nic = resp.total
        },
        () => {
          countList.nic = 0
        }
      ),
      this.cdRomsService.query(params).then(
        resp => {
          countList.cdrom = resp.total
        },
        () => {
          countList.cdrom = 0
        }
      ),
      this.scsiLunQueryService
        .queryList({
          conditions: [
            {
              key: 'scsiLunVmInstanceRef.vmInstanceUuid',
              op: Op.eq,
              value: uuid
            }
          ],
          count: true
        })
        .then(
          resp => {
            countList.lun = resp.total
          },
          () => {
            countList.lun = 0
          }
        ),
      this.usbService
        .query({
          conditions: [
            {
              key: 'vmInstanceUuid',
              op: Op.eq,
              value: uuid
            }
          ],
          count: true
        })
        .then(
          resp => {
            countList.usb = resp.total
          },
          () => {
            countList.usb = 0
          }
        ),
      this.queryMdevDeviceAction
        .call({
          count: true,
          conditions: [
            {
              key: 'vmInstanceUuid',
              value: uuid
            },
            {
              key: 'type',
              op: Op.in,
              values: ['SE_Controller']
            }
          ]
        })
        .then(resp => {
          countList.se = resp?.total ?? 0
        }),
      this.pciDeviceQueryService
        .get({
          ...params,
          type: 'gpu'
        })
        .then(
          resp => {
            countList.gpu = resp.total
          },
          () => {
            countList.gpu = 0
          }
        ),
      this.vGpuDeviceService
        .queryVGpuDevice({
          ...params,
          conditions: [
            {
              key: 'vmInstance.uuid',
              op: Op.eq,
              value: uuid
            },
            {
              key: 'type',
              op: Op.in,
              values: ['GPU_Video_Controller', 'GPU_3D_Controller']
            }
          ]
        })
        .then(
          resp => {
            countList.vgpu = resp.total
          },
          () => {
            countList.vgpu = 0
          }
        ),
      this.pciDeviceQueryService
        .get({
          ...params,
          type: 'pci'
        })
        .then(
          resp => {
            countList.pci = resp.total
          },
          () => {
            countList.pci = 0
          }
        )
    ])
    return countList
  }
  @Query(() => VmExternalDevice)
  async vmExternalDevice(@Args('uuid') uuid: string) {
    const externalDeviceCountList: VmExternalDevice = {
      lun: 0,
      usb: 0,
      gpu: 0,
      vgpu: 0,
      pci: 0
    }
    const params = {
      conditions: [
        {
          key: 'vmInstance.uuid',
          op: Op.eq,
          value: uuid
        }
      ],
      count: true
    }
    await Promise.all([
      this.scsiLunQueryService
        .queryList({
          conditions: [
            {
              key: 'scsiLunVmInstanceRef.vmInstanceUuid',
              op: Op.eq,
              value: uuid
            }
          ],
          count: true
        })
        .then(
          resp => {
            externalDeviceCountList.lun = resp.total
          },
          () => {
            externalDeviceCountList.lun = 0
          }
        ),
      this.usbService
        .query({
          conditions: [
            {
              key: 'vmInstanceUuid',
              op: Op.eq,
              value: uuid
            }
          ],
          count: true
        })
        .then(
          resp => {
            externalDeviceCountList.usb = resp.total
          },
          () => {
            externalDeviceCountList.usb = 0
          }
        ),
      this.pciDeviceQueryService
        .get({
          ...params,
          type: 'gpu'
        })
        .then(
          resp => {
            externalDeviceCountList.gpu = resp.total
          },
          () => {
            externalDeviceCountList.gpu = 0
          }
        ),
      this.vGpuDeviceService.queryVGpuDevice({ params }).then(
        resp => {
          externalDeviceCountList.vgpu = resp.total
        },
        () => {
          externalDeviceCountList.vgpu = 0
        }
      ),
      this.pciDeviceQueryService
        .get({
          ...params,
          type: 'pci'
        })
        .then(
          resp => {
            externalDeviceCountList.pci = resp.total
          },
          () => {
            externalDeviceCountList.pci = 0
          }
        )
    ])
    return externalDeviceCountList
  }
}
