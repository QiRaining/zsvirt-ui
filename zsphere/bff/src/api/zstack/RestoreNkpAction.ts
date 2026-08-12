import { Injectable } from "@nestjs/common";
import { ActionInfo } from "./base/types";

import { ActionAdvance } from "./base/action-advance";

@Injectable()
export class RestoreNkpAction extends ActionAdvance {
  async call(
    params: RestoreNkpActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RestoreNkpResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RestoreNkpAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/key-providers/nkp/actions`,
      {
        restoreNkp: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RestoreNkpResult>(
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

export interface RestoreNkpActionParam {
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

export interface RestoreNkpResult {
  inventory?: any;
}
