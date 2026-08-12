import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SNSSnmpTestConnectionAction extends ActionAdvance {
  async call(
    params: SNSSnmpTestConnectionActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SNSSnmpTestConnectionResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SNSSnmpTestConnectionAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/sns/application-endpoints/snmp/test-connection`,
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
    return this.postAction<SNSSnmpTestConnectionResult>(
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

export interface SNSSnmpTestConnectionActionParam {
  platformUuid?: string;
  endpointUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SNSSnmpTestConnectionResult {
  connected?: boolean;
  webhookResp?: any;
}
