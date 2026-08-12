import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VolumeInventory } from "./types";

@Injectable()
export class ResizeRootVolumeAction extends ActionAdvance {
  async call(
    params: ResizeRootVolumeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ResizeRootVolumeResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ResizeRootVolumeAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/volumes/resize/${params.uuid}/actions`,
      {
        resizeRootVolume: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ResizeRootVolumeResult>(
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

export interface ResizeRootVolumeActionParam {
  uuid?: string;
  vmInstanceUuid?: string;
  size: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ResizeRootVolumeResult {
  inventory?: VolumeInventory;
}
