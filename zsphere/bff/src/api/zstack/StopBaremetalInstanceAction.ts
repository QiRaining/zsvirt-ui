import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BaremetalInstanceInventory } from "./types";

@Injectable()
export class StopBaremetalInstanceAction extends ActionAdvance {
  async call(
    params: StopBaremetalInstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<StopBaremetalInstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      StopBaremetalInstanceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/baremetal/instances/${params.uuid}/actions`,
      {
        stopBaremetalInstance: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<StopBaremetalInstanceResult>(
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

export interface StopBaremetalInstanceActionParam {
  uuid: string;
  type?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface StopBaremetalInstanceResult {
  inventory?: BaremetalInstanceInventory;
}
