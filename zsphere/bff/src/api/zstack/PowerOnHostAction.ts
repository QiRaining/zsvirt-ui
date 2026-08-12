import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { HostInventory } from "./types";

@Injectable()
export class PowerOnHostAction extends ActionAdvance {
  async call(
    params: PowerOnHostActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<PowerOnHostResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      PowerOnHostAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/hosts/power/${params.uuid}/actions`,
      {
        powerOnHost: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<PowerOnHostResult>(
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

export interface PowerOnHostActionParam {
  uuid: string;
  returnEarly?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface PowerOnHostResult {
  inventory?: HostInventory;
}
