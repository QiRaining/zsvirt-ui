import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ZSha2DemoteAction extends ActionAdvance {
  async call(
    params: ZSha2DemoteActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ZSha2DemoteResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ZSha2DemoteAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/management-nodes/zsha2/demote`,
      {
        zSha2Demote: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ZSha2DemoteResult>(
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

export interface ZSha2DemoteActionParam {
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ZSha2DemoteResult {}
