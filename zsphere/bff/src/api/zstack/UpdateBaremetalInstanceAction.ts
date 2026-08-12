import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BaremetalInstanceInventory } from "./types";

@Injectable()
export class UpdateBaremetalInstanceAction extends ActionAdvance {
  async call(
    params: UpdateBaremetalInstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateBaremetalInstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateBaremetalInstanceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/baremetal/instances/${params.uuid}/actions`,
      {
        updateBaremetalInstance: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateBaremetalInstanceResult>(
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

export interface UpdateBaremetalInstanceActionParam {
  uuid: string;
  name?: string;
  description?: string;
  password?: string;
  platform?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateBaremetalInstanceResult {
  inventory?: BaremetalInstanceInventory;
}
