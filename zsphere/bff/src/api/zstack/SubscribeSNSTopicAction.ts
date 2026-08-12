import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SubscribeSNSTopicAction extends ActionAdvance {
  async call(
    params: SubscribeSNSTopicActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SubscribeSNSTopicResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SubscribeSNSTopicAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/sns/topics/${params.topicUuid}/endpoints/${params.endpointUuid}`,
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
    return this.postAction<SubscribeSNSTopicResult>(
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

export interface SubscribeSNSTopicActionParam {
  topicUuid: string;
  endpointUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SubscribeSNSTopicResult {}
