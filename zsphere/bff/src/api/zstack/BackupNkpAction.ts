import { Injectable } from "@nestjs/common";
import { ActionInfo } from "./base/types";

import { ActionAdvance } from "./base/action-advance";

@Injectable()
export class BackupNkpAction extends ActionAdvance {
  async call(
    params: BackupNkpActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<BackupNkpResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      BackupNkpAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/key-providers/nkp/${params.uuid}/actions`,
      {
        backupNkp: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<BackupNkpResult>(
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

export interface BackupNkpActionParam {
  uuid: string;
  password?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface BackupNkpResult {
  content?: string;
}
