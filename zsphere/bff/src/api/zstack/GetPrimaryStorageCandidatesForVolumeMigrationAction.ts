import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetPrimaryStorageCandidatesForVolumeMigrationAction extends QueryAdvance {
  async call(
    params: GetPrimaryStorageCandidatesForVolumeMigrationActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetPrimaryStorageCandidatesForVolumeMigrationResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetPrimaryStorageCandidatesForVolumeMigrationAction.name,
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
      "volumeUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/primary-storage/volumes/${params.volumeUuid}/migration-candidates${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetPrimaryStorageCandidatesForVolumeMigrationResult>(
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

export interface GetPrimaryStorageCandidatesForVolumeMigrationActionParam {
  volumeUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetPrimaryStorageCandidatesForVolumeMigrationResult {
  inventories?: any[];
}
