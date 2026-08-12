import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SetSecurityMachineKeyAction extends ActionAdvance {
  async call(
    params: SetSecurityMachineKeyActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SetSecurityMachineKeyResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SetSecurityMachineKeyAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/secret-resource-pool-token/set/${params.uuid}/actions`,
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
    return this.postAction<SetSecurityMachineKeyResult>(
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

export interface SetSecurityMachineKeyActionParam {
  uuid: string;
  type: string;
  tokenName: string;
  dryRun?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SetSecurityMachineKeyResult {
  inventories?: any[];
}
