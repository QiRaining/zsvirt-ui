import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSTopicInventory } from "./types";

@Injectable()
export class UpdateSNSTopicAction extends ActionAdvance {
  async call(
    params: UpdateSNSTopicActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSNSTopicResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateSNSTopicAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/sns/topics/${params.uuid}/actions`,
      {
        updateSNSTopic: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateSNSTopicResult>(
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

export interface UpdateSNSTopicActionParam {
  uuid: string;
  name?: string;
  description?: string;
  locale?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateSNSTopicResult {
  inventory?: SNSTopicInventory;
}
