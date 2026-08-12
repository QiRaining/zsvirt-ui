import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RemoveSNSFeiShuAtPersonAction extends ActionAdvance {
  async call(
    params: RemoveSNSFeiShuAtPersonActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RemoveSNSFeiShuAtPersonResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RemoveSNSFeiShuAtPersonAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "endpointUuid",
      "userId",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/sns/application-endpoints/feishu/${params.endpointUuid}/at-persons/${params.userId}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RemoveSNSFeiShuAtPersonResult>(
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

export interface RemoveSNSFeiShuAtPersonActionParam {
  endpointUuid: string;
  userId: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RemoveSNSFeiShuAtPersonResult {}
