import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SNSEmailTestConnectionAction extends ActionAdvance {
  async call(
    params: SNSEmailTestConnectionActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SNSEmailTestConnectionResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SNSEmailTestConnectionAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/sns/application-endpoints/email/test-connection`,
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
    return this.postAction<SNSEmailTestConnectionResult>(
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

export interface SNSEmailTestConnectionActionParam {
  emails?: any[];
  platformUuid?: string;
  endpointUuid?: string;
  subject?: string;
  text?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SNSEmailTestConnectionResult {
  connected?: boolean;
  webhookResp?: any;
}
