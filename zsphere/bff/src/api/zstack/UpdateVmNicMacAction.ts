import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmNicInventory } from "./types";

@Injectable()
export class UpdateVmNicMacAction extends ActionAdvance {
  async call(
    params: UpdateVmNicMacActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateVmNicMacResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateVmNicMacAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-instances/nics/${params.vmNicUuid}/actions`,
      {
        updateVmNicMac: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateVmNicMacResult>(
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

export interface UpdateVmNicMacActionParam {
  vmNicUuid: string;
  mac: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateVmNicMacResult {
  inventory?: VmNicInventory;
}
