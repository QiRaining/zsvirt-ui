import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { HybridAccountInventory } from "./types";

@Injectable()
export class UpdateHybridKeySecretAction extends ActionAdvance {
  async call(
    params: UpdateHybridKeySecretActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateHybridKeySecretResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateHybridKeySecretAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/hybrid/hybrid/${params.uuid}/key`,
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
    return this.postAction<UpdateHybridKeySecretResult>(
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

export interface UpdateHybridKeySecretActionParam {
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

export interface UpdateHybridKeySecretResult {
  inventory?: HybridAccountInventory;
}
