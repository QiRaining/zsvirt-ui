import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BlockVolumeInventory } from "./types";

@Injectable()
export class CreateBlockVolumeAction extends ActionAdvance {
  async call(
    params: CreateBlockVolumeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateBlockVolumeResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateBlockVolumeAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/block-volumes`,
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
    return this.postAction<CreateBlockVolumeResult>(
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

export interface CreateBlockVolumeActionParam {
  name: string;
  description?: string;
  size: number;
  primaryStorageUuid: string;
  accessPathId?: number;
  accessPathIqn?: string;
  burstTotalBw?: number;
  burstTotalIops?: number;
  maxTotalBw?: number;
  maxTotalIops?: number;
  protocol?: string;
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

export interface CreateBlockVolumeResult {
  inventory?: BlockVolumeInventory;
}
