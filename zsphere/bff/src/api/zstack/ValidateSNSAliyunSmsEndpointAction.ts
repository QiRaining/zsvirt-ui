import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ValidateSNSAliyunSmsEndpointAction extends ActionAdvance {
  async call(
    params: ValidateSNSAliyunSmsEndpointActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ValidateSNSAliyunSmsEndpointResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ValidateSNSAliyunSmsEndpointAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/sns/sms-endpoints/${params.uuid}/actions`,
      {
        validateSNSAliyunSmsEndpoint: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ValidateSNSAliyunSmsEndpointResult>(
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

export interface ValidateSNSAliyunSmsEndpointActionParam {
  uuid: string;
  phoneNumbers: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ValidateSNSAliyunSmsEndpointResult {}
