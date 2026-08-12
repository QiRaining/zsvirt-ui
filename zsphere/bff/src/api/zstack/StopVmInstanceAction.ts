import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmInstanceInventory } from "./types";

@Injectable()
export class StopVmInstanceAction extends ActionAdvance {
  async call(
    params: StopVmInstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<StopVmInstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      StopVmInstanceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-instances/${params.uuid}/actions`,
      {
        stopVmInstance: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<StopVmInstanceResult>(
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

export interface StopVmInstanceActionParam {
  uuid: string;
  type?: string;
  stopHA?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface StopVmInstanceResult {
  inventory?: VmInstanceInventory;
}
