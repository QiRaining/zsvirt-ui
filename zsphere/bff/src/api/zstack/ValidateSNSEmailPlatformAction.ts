import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ValidateSNSEmailPlatformAction extends ActionAdvance {
  async call(
    params: ValidateSNSEmailPlatformActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ValidateSNSEmailPlatformResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ValidateSNSEmailPlatformAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/sns/application-platforms/email/${params.uuid}/actions`,
      {
        validateSNSEmailPlatform: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ValidateSNSEmailPlatformResult>(
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

export interface ValidateSNSEmailPlatformActionParam {
  uuid?: string;
  smtpServer?: string;
  smtpPort?: number;
  username?: string;
  password?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ValidateSNSEmailPlatformResult {}
