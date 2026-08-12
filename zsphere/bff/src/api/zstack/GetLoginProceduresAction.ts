import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetLoginProceduresAction extends QueryAdvance {
  async call(
    params: GetLoginProceduresActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetLoginProceduresResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetLoginProceduresAction.name,
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
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/login/procedures${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetLoginProceduresResult>(
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

export interface GetLoginProceduresActionParam {
  username: string;
  loginType: string;
  systemTags?: any[];
  userTags?: any[];
  requestIp?: string;
  timeout?: number;
}

export interface GetLoginProceduresResult {
  procedures?: any[];
}
