import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class UnsubscribeSNSTopicAction extends ActionAdvance {
  async call(
    params: UnsubscribeSNSTopicActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UnsubscribeSNSTopicResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UnsubscribeSNSTopicAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "topicUuid",
      "endpointUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/sns/topics/${params.topicUuid}/endpoints/${params.endpointUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UnsubscribeSNSTopicResult>(
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

export interface UnsubscribeSNSTopicActionParam {
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

export interface UnsubscribeSNSTopicResult {}
