import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetTaskProgressAction extends QueryAdvance {
  async call(
    params: GetTaskProgressActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetTaskProgressResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetTaskProgressAction.name,
      params,
    );
    const paramString = this.genParamStringForGet(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "apiId",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/task-progresses/${params.apiId}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetTaskProgressResult>(
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

export interface GetTaskProgressActionParam {
  apiId?: string;
  all?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetTaskProgressResult {
  inventories?: any[];
}
