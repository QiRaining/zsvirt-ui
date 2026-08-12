import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmInstanceInventory } from "./types";

@Injectable()
export class DetachL3NetworkFromVmAction extends ActionAdvance {
  async call(
    params: DetachL3NetworkFromVmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachL3NetworkFromVmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachL3NetworkFromVmAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "vmNicUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/vm-instances/nics/${params.vmNicUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachL3NetworkFromVmResult>(
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

export interface DetachL3NetworkFromVmActionParam {
  vmNicUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DetachL3NetworkFromVmResult {
  inventory?: VmInstanceInventory;
}
