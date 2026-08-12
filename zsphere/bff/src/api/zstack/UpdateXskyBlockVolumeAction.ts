import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BlockVolumeInventory } from "./types";

@Injectable()
export class UpdateXskyBlockVolumeAction extends ActionAdvance {
  async call(
    params: UpdateXskyBlockVolumeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateBlockVolumeResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateXskyBlockVolumeAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/xsky/block-volumes/${params.uuid}/actions`,
      {
        updateXskyBlockVolume: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateBlockVolumeResult>(
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

export interface UpdateXskyBlockVolumeActionParam {
  burstTotalBw?: number;
  burstTotalIops?: number;
  maxTotalBw?: number;
  maxTotalIops?: number;
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateBlockVolumeResult {
  inventory?: BlockVolumeInventory;
}
