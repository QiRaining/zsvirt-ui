import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class UpdateAlarmDataAction extends ActionAdvance {
  async call(
    params: UpdateAlarmDataActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateAlarmDataResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateAlarmDataAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zwatch/alarm-histories/actions`,
      {
        updateAlarmData: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateAlarmDataResult>(
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

export interface UpdateAlarmDataActionParam {
  dataUuid?: string;
  dataStartTime?: number;
  dataEndTime?: number;
  updateMode: string;
  readStatus?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateAlarmDataResult {}
