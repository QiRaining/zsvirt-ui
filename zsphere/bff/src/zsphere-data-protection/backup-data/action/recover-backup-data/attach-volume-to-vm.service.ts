import { Inject, Injectable } from '@nestjs/common'

import { AttachDataVolumeToVmAction } from '@/api/zstack/AttachDataVolumeToVmAction'

@Injectable()
export class AttachDataVolumeToVmService {
  @Inject() attachDataVolumeToVmAction: AttachDataVolumeToVmAction

  async call(payload, createVolumeServiceData, taskAndActionId) {
    const { vmInstanceUuid } = payload

    const { uuid: volumeUuid } = createVolumeServiceData

    return await this.attachDataVolumeToVmAction.call(
      {
        vmInstanceUuid,
        volumeUuid
      },
      taskAndActionId
    )
  }
}
