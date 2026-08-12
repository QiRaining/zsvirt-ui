import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VolumeInventory } from "./types";

@Injectable()
export class CreateDataVolumeAction extends ActionAdvance {
  async call(
    params: CreateDataVolumeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateDataVolumeResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateDataVolumeAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/volumes/data`,
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
    return this.postAction<CreateDataVolumeResult>(
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

export interface CreateDataVolumeActionParam {
  name: string;
  description?: string;
  diskOfferingUuid?: string;
  diskSize?: number;
  primaryStorageUuid?: string;
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

export interface CreateDataVolumeResult {
  inventory?: VolumeInventory;
}
