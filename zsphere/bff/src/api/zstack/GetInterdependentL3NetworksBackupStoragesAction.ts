import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetInterdependentL3NetworksBackupStoragesAction extends QueryAdvance {
  async call(
    params: GetInterdependentL3NetworksBackupStoragesActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetInterdependentL3NetworksBackupStoragesResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetInterdependentL3NetworksBackupStoragesAction.name,
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
      `/backupStorage-l3networks/dependencies${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetInterdependentL3NetworksBackupStoragesResult>(
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

export interface GetInterdependentL3NetworksBackupStoragesActionParam {
  zoneUuid: string;
  backupStorageUuid?: string;
  l3NetworkUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetInterdependentL3NetworksBackupStoragesResult {
  inventories?: any[];
}
