import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { MdevDeviceInventory } from "./types";

@Injectable()
export class UpdateMdevDeviceAction extends ActionAdvance {
  async call(
    params: UpdateMdevDeviceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateMdevDeviceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateMdevDeviceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/mdev-devices/${params.uuid}/actions`,
      {
        updateMdevDevice: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateMdevDeviceResult>(
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

export interface UpdateMdevDeviceActionParam {
  uuid: string;
  name?: string;
  description?: string;
  state?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateMdevDeviceResult {
  inventory?: MdevDeviceInventory;
}
