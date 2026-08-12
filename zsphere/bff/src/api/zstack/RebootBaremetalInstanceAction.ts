import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BaremetalInstanceInventory } from "./types";

@Injectable()
export class RebootBaremetalInstanceAction extends ActionAdvance {
  async call(
    params: RebootBaremetalInstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RebootBaremetalInstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RebootBaremetalInstanceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/baremetal/instances/${params.uuid}/actions`,
      {
        rebootBaremetalInstance: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RebootBaremetalInstanceResult>(
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

export interface RebootBaremetalInstanceActionParam {
  uuid: string;
  pxeBoot?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RebootBaremetalInstanceResult {
  inventory?: BaremetalInstanceInventory;
}
