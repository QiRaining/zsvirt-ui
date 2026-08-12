import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ImageInventory } from "./types";

@Injectable()
export class CreateDataVolumeTemplateFromVolumeBackupAction extends ActionAdvance {
  async call(
    params: CreateDataVolumeTemplateFromVolumeBackupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateDataVolumeTemplateFromVolumeBackupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateDataVolumeTemplateFromVolumeBackupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/images/data-volume-templates/from/volume-template/${params.backupUuid}`,
      {
        params: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<CreateDataVolumeTemplateFromVolumeBackupResult>(
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
      httpRequestPromise,
      needRecord,
      apiRecord,
    );
  }
}

export interface CreateDataVolumeTemplateFromVolumeBackupActionParam {
  backupUuid: string;
  backupStorageUuid: string;
  name: string;
  description?: string;
  guestOsType?: string;
  platform?: string;
  architecture?: string;
  system?: boolean;
  virtio?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CreateDataVolumeTemplateFromVolumeBackupResult {
  inventory?: ImageInventory;
}
