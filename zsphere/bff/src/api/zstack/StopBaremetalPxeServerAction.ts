import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BaremetalPxeServerInventory } from "./types";

@Injectable()
export class StopBaremetalPxeServerAction extends ActionAdvance {
  async call(
    params: StopBaremetalPxeServerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<StopBaremetalPxeServerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      StopBaremetalPxeServerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/baremetal/pxeservers/${params.uuid}/actions`,
      {
        stopBaremetalPxeServer: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<StopBaremetalPxeServerResult>(
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

export interface StopBaremetalPxeServerActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface StopBaremetalPxeServerResult {
  inventory?: BaremetalPxeServerInventory;
}
