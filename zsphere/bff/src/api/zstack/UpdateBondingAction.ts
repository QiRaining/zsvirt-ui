import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { HostNetworkBondingInventory } from "./types";

@Injectable()
export class UpdateBondingAction extends ActionAdvance {
  async call(
    params: UpdateBondingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateBondingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateBondingAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/hosts/bondings/${params.uuid}/actions`,
      {
        updateBonding: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateBondingResult>(
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

export interface UpdateBondingActionParam {
  uuid: string;
  slaveUuids?: any[];
  slaveNames?: any[];
  type?: string;
  mode?: string;
  xmitHashPolicy?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateBondingResult {
  inventory?: HostNetworkBondingInventory;
}
