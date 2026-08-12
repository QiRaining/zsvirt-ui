import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SecurityMachineEncryptAction extends ActionAdvance {
  async call(
    params: SecurityMachineEncryptActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SecurityMachineEncryptResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SecurityMachineEncryptAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/security-machine/encrypt/actions`,
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
    return this.postAction<SecurityMachineEncryptResult>(
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

export interface SecurityMachineEncryptActionParam {
  text: string;
  algType: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SecurityMachineEncryptResult {
  text?: string;
}
