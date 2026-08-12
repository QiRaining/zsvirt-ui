import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { HostInventory } from "./types";

@Injectable()
export class ShutdownHostAction extends ActionAdvance {
  async call(
    params: ShutdownHostActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ShutdownHostResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ShutdownHostAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/hosts/power/${params.uuid}/actions`,
      {
        shutdownHost: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ShutdownHostResult>(
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

export interface ShutdownHostActionParam {
  uuid: string;
  returnEarly?: boolean;
  force?: boolean;
  method?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ShutdownHostResult {
  inventory?: HostInventory;
}
