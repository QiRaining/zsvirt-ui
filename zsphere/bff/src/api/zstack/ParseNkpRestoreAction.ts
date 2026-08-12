import { Injectable } from "@nestjs/common";
import { ActionInfo } from "./base/types";

import { ActionAdvance } from "./base/action-advance";

@Injectable()
export class ParseNkpRestoreAction extends ActionAdvance {
  async call(
    params: ParseNkpRestoreActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ParseNkpRestoreResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ParseNkpRestoreAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/key-providers/nkp/actions`,
      {
        parseNkpRestore: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ParseNkpRestoreResult>(
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

export interface ParseNkpRestoreActionParam {
  contentBase64: string;
  password?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ParseNkpRestoreResult {
  restoreInfo?: any;
  code?: string;
  reason?: string;
}
