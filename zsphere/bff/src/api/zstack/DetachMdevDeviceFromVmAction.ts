import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { MdevDeviceInventory } from "./types";

@Injectable()
export class DetachMdevDeviceFromVmAction extends ActionAdvance {
  async call(
    params: DetachMdevDeviceFromVmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachMdevDeviceFromVmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachMdevDeviceFromVmAction.name,
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
      "mdevDeviceUuid",
      "vmInstanceUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/mdev-devices/${params.mdevDeviceUuid}/vm-instances/${params.vmInstanceUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachMdevDeviceFromVmResult>(
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

export interface DetachMdevDeviceFromVmActionParam {
  mdevDeviceUuid: string;
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DetachMdevDeviceFromVmResult {
  inventory?: MdevDeviceInventory;
}
