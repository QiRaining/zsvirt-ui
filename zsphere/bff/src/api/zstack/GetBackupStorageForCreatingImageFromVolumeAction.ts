import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetBackupStorageForCreatingImageFromVolumeAction extends QueryAdvance {
  async call(
    params: GetBackupStorageForCreatingImageFromVolumeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetCandidateBackupStorageForCreatingImageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetBackupStorageForCreatingImageFromVolumeAction.name,
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
      `/images/volumes/${params.volumeUuid}/candidate-backup-storage${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetCandidateBackupStorageForCreatingImageResult>(
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

export interface GetBackupStorageForCreatingImageFromVolumeActionParam {
  volumeUuid?: string;
  volumeSnapshotUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetCandidateBackupStorageForCreatingImageResult {
  inventories?: any[];
}
