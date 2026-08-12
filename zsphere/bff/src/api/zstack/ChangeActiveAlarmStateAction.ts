import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ChangeActiveAlarmStateAction extends ActionAdvance {
  async call(
    params: ChangeActiveAlarmStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeActiveAlarmStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeActiveAlarmStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zwatch/activealarms/actions`,
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
    return this.postAction<ChangeActiveAlarmStateResult>(
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

export interface ChangeActiveAlarmStateActionParam {
  namespace: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeActiveAlarmStateResult {}
