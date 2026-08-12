import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";
import { TwoFactorAuthenticationSecretInventory } from "./types";

@Injectable()
export class GetTwoFactorAuthenticationSecretAction extends QueryAdvance {
  async call(
    params: GetTwoFactorAuthenticationSecretActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetTwoFactorAuthenticationSecretResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetTwoFactorAuthenticationSecretAction.name,
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
      `/twofactorauthentication/secret${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetTwoFactorAuthenticationSecretResult>(
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

export interface GetTwoFactorAuthenticationSecretActionParam {
  name: string;
  password: string;
  type?: string;
  captchaUuid?: string;
  verifyCode?: string;
  systemTags?: any[];
  userTags?: any[];
  requestIp?: string;
  timeout?: number;
}

export interface GetTwoFactorAuthenticationSecretResult {
  inventory?: TwoFactorAuthenticationSecretInventory;
}
