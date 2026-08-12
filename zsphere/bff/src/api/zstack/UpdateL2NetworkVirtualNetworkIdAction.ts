import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { L2NetworkInventory } from "./types";

@Injectable()
export class UpdateL2NetworkVirtualNetworkIdAction extends ActionAdvance {
  async call(
    params: UpdateL2NetworkVirtualNetworkIdActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateL2NetworkVirtualNetworkIdResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateL2NetworkVirtualNetworkIdAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/l2-networks/${params.uuid}/actions`,
      {
        updateL2NetworkVirtualNetworkId: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateL2NetworkVirtualNetworkIdResult>(
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

export interface UpdateL2NetworkVirtualNetworkIdActionParam {
  uuid: string;
  virtualNetworkId: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateL2NetworkVirtualNetworkIdResult {
  inventory?: L2NetworkInventory;
}
