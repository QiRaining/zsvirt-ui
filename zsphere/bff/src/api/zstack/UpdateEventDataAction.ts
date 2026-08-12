import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class UpdateEventDataAction extends ActionAdvance {
  async call(
    params: UpdateEventDataActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateEventDataResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateEventDataAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zwatch/events/actions`,
      {
        updateEventData: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateEventDataResult>(
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

export interface UpdateEventDataActionParam {
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

export interface UpdateEventDataResult {}
