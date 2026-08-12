import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { HostInventory } from "./types";

@Injectable()
export class ChangeHostStateAction extends ActionAdvance {
  async call(
    params: ChangeHostStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeHostStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeHostStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/hosts/${params.uuid}/actions`,
      {
        changeHostState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeHostStateResult>(
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

export interface ChangeHostStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeHostStateResult {
  inventory?: HostInventory;
}
