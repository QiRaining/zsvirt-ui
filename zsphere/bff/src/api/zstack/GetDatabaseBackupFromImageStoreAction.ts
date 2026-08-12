import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetDatabaseBackupFromImageStoreAction extends QueryAdvance {
  async call(
    params: GetDatabaseBackupFromImageStoreActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetDatabaseBackupFromImageStoreResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetDatabaseBackupFromImageStoreAction.name,
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
      `/database-backups/image-store${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetDatabaseBackupFromImageStoreResult>(
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

export interface GetDatabaseBackupFromImageStoreActionParam {
  url: string;
  registryPort?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetDatabaseBackupFromImageStoreResult {
  backups?: any[];
}
