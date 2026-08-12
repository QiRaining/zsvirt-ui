import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class CancelLongJobAction extends ActionAdvance {
  async call(
    params: CancelLongJobActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CancelLongJobResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CancelLongJobAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/longjobs/${params.uuid}/actions`,
      {
        cancelLongJob: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<CancelLongJobResult>(
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

export interface CancelLongJobActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CancelLongJobResult {}
