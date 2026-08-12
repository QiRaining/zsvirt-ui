import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { MdevDeviceSpecInventory } from "./types";

@Injectable()
export class UpdateMdevDeviceSpecAction extends ActionAdvance {
  async call(
    params: UpdateMdevDeviceSpecActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateMdevDeviceSpecResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateMdevDeviceSpecAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/mdev-device-specs/${params.uuid}/actions`,
      {
        updateMdevDeviceSpec: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateMdevDeviceSpecResult>(
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

export interface UpdateMdevDeviceSpecActionParam {
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

export interface UpdateMdevDeviceSpecResult {
  inventory?: MdevDeviceSpecInventory;
}
