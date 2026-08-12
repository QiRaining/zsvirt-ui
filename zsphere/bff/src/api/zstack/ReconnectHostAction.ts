import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { HostInventory } from "./types";

@Injectable()
export class ReconnectHostAction extends ActionAdvance {
  async call(
    params: ReconnectHostActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ReconnectHostResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ReconnectHostAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/hosts/${params.uuid}/actions`,
      {
        reconnectHost: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ReconnectHostResult>(
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

export interface ReconnectHostActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ReconnectHostResult {
  inventory?: HostInventory;
}
