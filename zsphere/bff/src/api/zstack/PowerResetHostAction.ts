import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { HostInventory } from "./types";

@Injectable()
export class PowerResetHostAction extends ActionAdvance {
  async call(
    params: PowerResetHostActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<PowerResetHostResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      PowerResetHostAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/hosts/power/${params.uuid}/actions`,
      {
        powerResetHost: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<PowerResetHostResult>(
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

export interface PowerResetHostActionParam {
  uuid: string;
  returnEarly?: boolean;
  method?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface PowerResetHostResult {
  inventory?: HostInventory;
}
