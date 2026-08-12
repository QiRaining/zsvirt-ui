import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BaremetalPxeServerInventory } from "./types";

@Injectable()
export class ReconnectBaremetalPxeServerAction extends ActionAdvance {
  async call(
    params: ReconnectBaremetalPxeServerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ReconnectBaremetalPxeServerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ReconnectBaremetalPxeServerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/baremetal/pxeservers/${params.uuid}/actions`,
      {
        reconnectBaremetalPxeServer: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ReconnectBaremetalPxeServerResult>(
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

export interface ReconnectBaremetalPxeServerActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ReconnectBaremetalPxeServerResult {
  inventory?: BaremetalPxeServerInventory;
}
