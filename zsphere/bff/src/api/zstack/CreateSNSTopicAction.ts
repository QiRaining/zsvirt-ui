import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSTopicInventory } from "./types";

@Injectable()
export class CreateSNSTopicAction extends ActionAdvance {
  async call(
    params: CreateSNSTopicActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateSNSTopicResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateSNSTopicAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/sns/topics`,
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
    return this.postAction<CreateSNSTopicResult>(
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

export interface CreateSNSTopicActionParam {
  name: string;
  description?: string;
  locale?: string;
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

export interface CreateSNSTopicResult {
  inventory?: SNSTopicInventory;
}
