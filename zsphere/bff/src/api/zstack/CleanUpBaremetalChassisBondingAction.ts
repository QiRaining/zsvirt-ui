import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class CleanUpBaremetalChassisBondingAction extends ActionAdvance {
  async call(
    params: CleanUpBaremetalChassisBondingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CleanUpBaremetalChassisBondingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CleanUpBaremetalChassisBondingAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/baremetal/chassis/${params.chassisUuid}/actions`,
      {
        cleanUpBaremetalChassisBonding: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<CleanUpBaremetalChassisBondingResult>(
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

export interface CleanUpBaremetalChassisBondingActionParam {
  chassisUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CleanUpBaremetalChassisBondingResult {}
