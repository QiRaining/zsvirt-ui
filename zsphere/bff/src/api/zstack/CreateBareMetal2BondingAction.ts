import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BareMetal2BondingInventory } from "./types";

@Injectable()
export class CreateBareMetal2BondingAction extends ActionAdvance {
  async call(
    params: CreateBareMetal2BondingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateBareMetal2BondingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateBareMetal2BondingAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/baremetal2/chassis/bond`,
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
    return this.postAction<CreateBareMetal2BondingResult>(
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

export interface CreateBareMetal2BondingActionParam {
  chassisUuid: string;
  name: string;
  mode: number;
  slaves: string;
  opts?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CreateBareMetal2BondingResult {
  inventory?: BareMetal2BondingInventory;
}
