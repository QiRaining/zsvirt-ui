import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class RefreshCaptchaAction extends QueryAdvance {
  async call(
    params: RefreshCaptchaActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RefreshCaptchaResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RefreshCaptchaAction.name,
      params,
    );
    const paramString = this.genParamStringForGet(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/captcha/refresh${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RefreshCaptchaResult>(
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

export interface RefreshCaptchaActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  requestIp?: string;
  timeout?: number;
}

export interface RefreshCaptchaResult {
  captchaUuid?: string;
  captcha?: string;
}
