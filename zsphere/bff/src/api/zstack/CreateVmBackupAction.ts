import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class CreateVmBackupAction extends ActionAdvance {
  async call(
    params: CreateVmBackupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateVmBackupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateVmBackupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/volumes/${params.rootVolumeUuid}/vm-backups`,
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
    return this.postAction<CreateVmBackupResult>(
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

export interface CreateVmBackupActionParam {
  rootVolumeUuid: string;
  backupStorageUuid: string;
  name: string;
  description?: string;
  mode?: string;
  volumeReadBandwidth?: number;
  volumeWriteBandwidth?: number;
  networkReadBandwidth?: number;
  networkWriteBandwidth?: number;
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

export interface CreateVmBackupResult {
  inventories?: any[];
}
