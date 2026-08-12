import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ImageInventory } from "./types";

@Injectable()
export class SyncImageSizeAction extends ActionAdvance {
  async call(
    params: SyncImageSizeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SyncImageSizeResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SyncImageSizeAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/images/${params.uuid}/actions`,
      {
        syncImageSize: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<SyncImageSizeResult>(
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

export interface SyncImageSizeActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SyncImageSizeResult {
  inventory?: ImageInventory;
}
