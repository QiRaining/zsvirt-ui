import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { LongJobInventory } from "./types";

@Injectable()
export class ResumeLongJobAction extends ActionAdvance {
  async call(
    params: ResumeLongJobActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ResumeLongJobResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ResumeLongJobAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/longjobs/${params.uuid}/actions`,
      {
        resumeLongJob: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ResumeLongJobResult>(
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

export interface ResumeLongJobActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ResumeLongJobResult {
  inventory?: LongJobInventory;
}
