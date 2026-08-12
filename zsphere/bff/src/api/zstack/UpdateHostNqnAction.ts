import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { HostInventory } from "./types";

@Injectable()
export class UpdateHostNqnAction extends ActionAdvance {
  async call(
    params: UpdateHostNqnActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateHostNqnResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateHostNqnAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/hosts/nqn/${params.uuid}/actions`,
      {
        updateHostNqn: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateHostNqnResult>(
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

export interface UpdateHostNqnActionParam {
  uuid: string;
  nqn: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateHostNqnResult {
  inventory?: HostInventory;
}
