import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class CreateBondingAction extends ActionAdvance {
  async call(
    params: CreateBondingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateBondingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateBondingAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/hosts/bondings`,
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
    return this.postAction<CreateBondingResult>(
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

export interface CreateBondingActionParam {
  hostUuids: any[];
  bondingName: string;
  slaveUuids?: any[];
  slaveNames?: any[];
  type: string;
  mode: string;
  xmitHashPolicy?: string;
  description?: string;
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

export interface CreateBondingResult {
  inventory?: any[];
}
