import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BaremetalPxeServerInventory } from "./types";

@Injectable()
export class UpdateBaremetalPxeServerAction extends ActionAdvance {
  async call(
    params: UpdateBaremetalPxeServerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateBaremetalPxeServerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateBaremetalPxeServerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/baremetal/pxeservers/${params.uuid}/actions`,
      {
        updateBaremetalPxeServer: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateBaremetalPxeServerResult>(
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

export interface UpdateBaremetalPxeServerActionParam {
  uuid: string;
  name?: string;
  description?: string;
  dhcpRangeBegin?: string;
  dhcpRangeEnd?: string;
  dhcpRangeNetmask?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateBaremetalPxeServerResult {
  inventory?: BaremetalPxeServerInventory;
}
