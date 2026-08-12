import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { L2NetworkInventory } from "./types";

@Injectable()
export class UpdateL2NetworkAction extends ActionAdvance {
  async call(
    params: UpdateL2NetworkActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateL2NetworkResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateL2NetworkAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/l2-networks/${params.uuid}/actions`,
      {
        updateL2Network: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateL2NetworkResult>(
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

export interface UpdateL2NetworkActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateL2NetworkResult {
  inventory?: L2NetworkInventory;
}
