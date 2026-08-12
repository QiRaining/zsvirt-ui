import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ResourceAttributeKeyInventory } from "./types";

@Injectable()
export class CreateResourceAttributeKeyAction extends ActionAdvance {
  async call(
    params: CreateResourceAttributeKeyActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateResourceAttributeKeyResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateResourceAttributeKeyAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/resource-attributes`,
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
    return this.postAction<CreateResourceAttributeKeyResult>(
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

export interface CreateResourceAttributeKeyActionParam {
  name: string;
  description?: string;
  resourceTypes?: any[];
  constraints?: any[];
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

export interface CreateResourceAttributeKeyResult {
  inventory?: ResourceAttributeKeyInventory;
}
