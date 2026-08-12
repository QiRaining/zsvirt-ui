import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ResourceStackInventory } from "./types";

@Injectable()
export class CreateResourceStackAction extends ActionAdvance {
  async call(
    params: CreateResourceStackActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateResourceStackResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateResourceStackAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/cloudformation/stack`,
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
    return this.postAction<CreateResourceStackResult>(
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

export interface CreateResourceStackActionParam {
  name: string;
  description?: string;
  type?: string;
  rollback?: boolean;
  templateContent?: string;
  templateUuid?: string;
  parameters?: string;
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

export interface CreateResourceStackResult {
  inventory?: ResourceStackInventory;
}
