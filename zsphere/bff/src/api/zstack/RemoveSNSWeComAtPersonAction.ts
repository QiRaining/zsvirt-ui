import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RemoveSNSWeComAtPersonAction extends ActionAdvance {
  async call(
    params: RemoveSNSWeComAtPersonActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RemoveSNSWeComAtPersonResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RemoveSNSWeComAtPersonAction.name,
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
      `/sns/application-endpoints/we-com/${params.endpointUuid}/at-persons/${params.userId}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RemoveSNSWeComAtPersonResult>(
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

export interface RemoveSNSWeComAtPersonActionParam {
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

export interface RemoveSNSWeComAtPersonResult {}
