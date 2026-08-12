import { Inject, Injectable } from '@nestjs/common'

import { DeleteImageAction } from '@/api/zstack/DeleteImageAction'

@Injectable()
export class DeleteImageService {
  @Inject() private deleteImageAction: DeleteImageAction

  async call(createVolumeTemplateFromVolumeBackupData, taskAndActionId) {
    const { uuid } = createVolumeTemplateFromVolumeBackupData

    return await this.deleteImageAction.call({ uuid }, taskAndActionId)
  }
}
