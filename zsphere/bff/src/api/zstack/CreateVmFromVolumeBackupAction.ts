import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmInstanceInventory } from "./types";

@Injectable()
export class CreateVmFromVolumeBackupAction extends ActionAdvance {
  async call(
    params: CreateVmFromVolumeBackupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateVmFromVolumeBackupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateVmFromVolumeBackupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/vm-instances/from/vm-backup/${params.backupUuid}`,
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
    return this.postAction<CreateVmFromVolumeBackupResult>(
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

export interface CreateVmFromVolumeBackupActionParam {
  name: string;
  backupUuid: string;
  backupStorageUuid?: string;
  instanceOfferingUuid: string;
  defaultL3NetworkUuid?: string;
  l3NetworkUuids: any[];
  type?: string;
  zoneUuid?: string;
  clusterUuid?: string;
  hostUuid?: string;
  primaryStorageUuidForRootVolume?: string;
  description?: string;
  rootVolumeSystemTags?: any[];
  strategy?: string;
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

export interface CreateVmFromVolumeBackupResult {
  inventory?: VmInstanceInventory;
}
