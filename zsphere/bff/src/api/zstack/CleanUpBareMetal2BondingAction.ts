import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class CleanUpBareMetal2BondingAction extends ActionAdvance {
  async call(
    params: CleanUpBareMetal2BondingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CleanUpBaremetal2BondingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CleanUpBareMetal2BondingAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/baremetal2/chassis/${params.chassisUuid}/actions`,
      {
        cleanUpBareMetal2Bonding: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<CleanUpBaremetal2BondingResult>(
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

export interface CleanUpBareMetal2BondingActionParam {
  chassisUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CleanUpBaremetal2BondingResult {}
