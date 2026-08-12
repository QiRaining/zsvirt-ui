import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetPrimaryStorageCandidatesForVmMigrationAction extends QueryAdvance {
  async call(
    params: GetPrimaryStorageCandidatesForVmMigrationActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetPrimaryStorageCandidatesForVmMigrationResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetPrimaryStorageCandidatesForVmMigrationAction.name,
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
      "vmInstanceUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/vm-instances/${params.vmInstanceUuid}/storage-migration-candidates${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetPrimaryStorageCandidatesForVmMigrationResult>(
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

export interface GetPrimaryStorageCandidatesForVmMigrationActionParam {
  vmInstanceUuid: string;
  withDataVolumes?: boolean;
  migrateStorageOnly?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetPrimaryStorageCandidatesForVmMigrationResult {
  inventories?: any[];
}
