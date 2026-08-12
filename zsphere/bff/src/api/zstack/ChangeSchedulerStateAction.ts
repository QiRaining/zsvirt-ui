import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SchedulerJobInventory } from "./types";

@Injectable()
export class ChangeSchedulerStateAction extends ActionAdvance {
  async call(
    params: ChangeSchedulerStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeSchedulerStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeSchedulerStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/schedulers/${params.uuid}`,
      {
        changeSchedulerState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeSchedulerStateResult>(
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

export interface ChangeSchedulerStateActionParam {
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

export interface ChangeSchedulerStateResult {
  inventory?: SchedulerJobInventory;
}
