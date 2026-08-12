import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { MdevDeviceInventory } from "./types";

@Injectable()
export class AttachMdevDeviceToVmAction extends ActionAdvance {
  async call(
    params: AttachMdevDeviceToVmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachMdevDeviceToVmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachMdevDeviceToVmAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/mdev-devices/${params.mdevDeviceUuid}/vm-instances/${params.vmInstanceUuid}`,
      {
        params: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<AttachMdevDeviceToVmResult>(
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

export interface AttachMdevDeviceToVmActionParam {
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

export interface AttachMdevDeviceToVmResult {
  inventory?: MdevDeviceInventory;
}
