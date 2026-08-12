import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ImageInventory } from "./types";

@Injectable()
export class CreateRootVolumeTemplateFromVolumeBackupAction extends ActionAdvance {
  async call(
    params: CreateRootVolumeTemplateFromVolumeBackupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateRootVolumeTemplateFromVolumeBackupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateRootVolumeTemplateFromVolumeBackupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/images/root-volume-templates/from/volume-template/${params.backupUuid}`,
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
    return this.postAction<CreateRootVolumeTemplateFromVolumeBackupResult>(
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

export interface CreateRootVolumeTemplateFromVolumeBackupActionParam {
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

export interface CreateRootVolumeTemplateFromVolumeBackupResult {
  inventory?: ImageInventory;
}
