import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ExternalPrimaryStorageInventory } from "./types";

@Injectable()
export class DiscoverExternalPrimaryStorageAction extends ActionAdvance {
  async call(
    params: DiscoverExternalPrimaryStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DiscoverExternalPrimaryStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DiscoverExternalPrimaryStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/primary-storage/addon/discover`,
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
    return this.postAction<DiscoverExternalPrimaryStorageResult>(
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

export interface DiscoverExternalPrimaryStorageActionParam {
  url: string;
  identity?: string;
  config?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DiscoverExternalPrimaryStorageResult {
  inventory?: ExternalPrimaryStorageInventory;
}
