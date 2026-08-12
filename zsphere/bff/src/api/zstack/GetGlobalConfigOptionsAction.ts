import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetGlobalConfigOptionsAction extends QueryAdvance {
  async call(
    params: GetGlobalConfigOptionsActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetGlobalConfigOptionsResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetGlobalConfigOptionsAction.name,
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
      "category",
      "name",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/global-configurations/${params.category}/${params.name}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetGlobalConfigOptionsResult>(
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

export interface GetGlobalConfigOptionsActionParam {
  category: string;
  name: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetGlobalConfigOptionsResult {
  options?: any;
}
