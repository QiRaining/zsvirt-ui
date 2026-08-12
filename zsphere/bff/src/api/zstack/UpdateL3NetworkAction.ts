import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { L3NetworkInventory } from "./types";

@Injectable()
export class UpdateL3NetworkAction extends ActionAdvance {
  async call(
    params: UpdateL3NetworkActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateL3NetworkResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateL3NetworkAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/l3-networks/${params.uuid}/actions`,
      {
        updateL3Network: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateL3NetworkResult>(
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

export interface UpdateL3NetworkActionParam {
  uuid: string;
  name?: string;
  description?: string;
  dnsDomain?: string;
  category?: string;
  system?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateL3NetworkResult {
  inventory?: L3NetworkInventory;
}
