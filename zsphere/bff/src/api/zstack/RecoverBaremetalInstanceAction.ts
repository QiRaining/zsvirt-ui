import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BaremetalInstanceInventory } from "./types";

@Injectable()
export class RecoverBaremetalInstanceAction extends ActionAdvance {
  async call(
    params: RecoverBaremetalInstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RecoverBaremetalInstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RecoverBaremetalInstanceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/baremetal/instances/${params.uuid}/actions`,
      {
        recoverBaremetalInstance: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RecoverBaremetalInstanceResult>(
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

export interface RecoverBaremetalInstanceActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RecoverBaremetalInstanceResult {
  inventory?: BaremetalInstanceInventory;
}
