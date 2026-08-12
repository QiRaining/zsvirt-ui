import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmNicInventory } from "./types";

@Injectable()
export class UpdateVmNicDriverAction extends ActionAdvance {
  async call(
    params: UpdateVmNicDriverActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateVmNicDriverResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateVmNicDriverAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-instances/${params.vmInstanceUuid}/actions`,
      {
        updateVmNicDriver: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateVmNicDriverResult>(
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

export interface UpdateVmNicDriverActionParam {
  vmInstanceUuid: string;
  vmNicUuid: string;
  driverType: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateVmNicDriverResult {
  inventory?: VmNicInventory;
}
