import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { HostNetworkBondingInventory } from "./types";

@Injectable()
export class SetIpOnHostNetworkBondingAction extends ActionAdvance {
  async call(
    params: SetIpOnHostNetworkBondingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SetIpOnHostNetworkBondingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SetIpOnHostNetworkBondingAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/hosts/bondings/${params.bondingUuid}/ip`,
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
    return this.postAction<SetIpOnHostNetworkBondingResult>(
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

export interface SetIpOnHostNetworkBondingActionParam {
  bondingUuid: string;
  ipAddress?: string;
  netmask?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SetIpOnHostNetworkBondingResult {
  inventory?: HostNetworkBondingInventory;
}
