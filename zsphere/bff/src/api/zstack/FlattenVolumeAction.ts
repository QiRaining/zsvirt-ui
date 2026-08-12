import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VolumeInventory } from "./types";

@Injectable()
export class FlattenVolumeAction extends ActionAdvance {
  async call(
    params: FlattenVolumeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<FlattenVolumeResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      FlattenVolumeAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/volumes/${params.uuid}/actions`,
      {
        flattenVolume: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<FlattenVolumeResult>(
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

export interface FlattenVolumeActionParam {
  uuid: string;
  dryRun?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface FlattenVolumeResult {
  inventory?: VolumeInventory;
}
