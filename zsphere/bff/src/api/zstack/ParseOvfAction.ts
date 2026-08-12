import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ParseOvfAction extends ActionAdvance {
  async call(
    params: ParseOvfActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ParseOvfResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ParseOvfAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/ovf/parse`,
      {
        params: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ParseOvfResult>(
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

export interface ParseOvfActionParam {
  xmlBase64: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ParseOvfResult {
  ovfInfo?: any;
}
