import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { HybridAccountInventory } from "./types";

@Injectable()
export class AddHybridKeySecretAction extends ActionAdvance {
  async call(
    params: AddHybridKeySecretActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddHybridKeySecretResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddHybridKeySecretAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/hybrid/hybrid/key`,
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
    return this.postAction<AddHybridKeySecretResult>(
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

export interface AddHybridKeySecretActionParam {
  name: string;
  key: string;
  secret: string;
  accountUuid?: string;
  description?: string;
  type: string;
  sync?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AddHybridKeySecretResult {
  inventory?: HybridAccountInventory;
}
