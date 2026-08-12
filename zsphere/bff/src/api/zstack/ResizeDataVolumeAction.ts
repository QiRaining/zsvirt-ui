import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VolumeInventory } from "./types";

@Injectable()
export class ResizeDataVolumeAction extends ActionAdvance {
  async call(
    params: ResizeDataVolumeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ResizeDataVolumeResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ResizeDataVolumeAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/volumes/data/resize/${params.uuid}/actions`,
      {
        resizeDataVolume: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ResizeDataVolumeResult>(
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

export interface ResizeDataVolumeActionParam {
  uuid: string;
  size: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ResizeDataVolumeResult {
  inventory?: VolumeInventory;
}
