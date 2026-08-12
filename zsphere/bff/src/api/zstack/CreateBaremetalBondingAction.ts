import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BaremetalBondingInventory } from "./types";

@Injectable()
export class CreateBaremetalBondingAction extends ActionAdvance {
  async call(
    params: CreateBaremetalBondingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateBaremetalBondingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateBaremetalBondingAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/baremetal/network/bondings`,
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
    return this.postAction<CreateBaremetalBondingResult>(
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

export interface CreateBaremetalBondingActionParam {
  chassisUuid: string;
  name: string;
  mode: number;
  slaves: string;
  opts?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CreateBaremetalBondingResult {
  inventory?: BaremetalBondingInventory;
}
