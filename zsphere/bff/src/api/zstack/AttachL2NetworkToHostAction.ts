import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { L2NetworkInventory } from "./types";

@Injectable()
export class AttachL2NetworkToHostAction extends ActionAdvance {
  async call(
    params: AttachL2NetworkToHostActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachL2NetworkToHostResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachL2NetworkToHostAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/l2-networks/${params.l2NetworkUuid}/hosts/${params.hostUuid}`,
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
    return this.postAction<AttachL2NetworkToHostResult>(
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

export interface AttachL2NetworkToHostActionParam {
  l2NetworkUuid: string;
  hostUuid: string;
  l2ProviderType?: string;
  hostParam?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachL2NetworkToHostResult {
  inventory?: L2NetworkInventory;
}
