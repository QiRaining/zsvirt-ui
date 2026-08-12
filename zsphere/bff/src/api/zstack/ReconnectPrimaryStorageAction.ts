import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PrimaryStorageInventory } from "./types";

@Injectable()
export class ReconnectPrimaryStorageAction extends ActionAdvance {
  async call(
    params: ReconnectPrimaryStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ReconnectPrimaryStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ReconnectPrimaryStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/primary-storage/${params.uuid}/actions`,
      {
        reconnectPrimaryStorage: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ReconnectPrimaryStorageResult>(
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

export interface ReconnectPrimaryStorageActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ReconnectPrimaryStorageResult {
  inventory?: PrimaryStorageInventory;
}
