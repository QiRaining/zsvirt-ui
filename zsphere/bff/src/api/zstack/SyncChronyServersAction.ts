import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SyncChronyServersAction extends ActionAdvance {
  async call(
    params: SyncChronyServersActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SyncChronyServersResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SyncChronyServersAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zops/chrony/actions`,
      {
        syncChronyServers: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<SyncChronyServersResult>(
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

export interface SyncChronyServersActionParam {
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SyncChronyServersResult {}
