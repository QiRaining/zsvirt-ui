import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class CheckVolumeSnapshotGroupAvailabilityAction extends QueryAdvance {
  async call(
    params: CheckVolumeSnapshotGroupAvailabilityActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CheckVolumeSnapshotGroupAvailabilityResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CheckVolumeSnapshotGroupAvailabilityAction.name,
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
      `/volume-snapshots/groups/availabilities${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<CheckVolumeSnapshotGroupAvailabilityResult>(
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

export interface CheckVolumeSnapshotGroupAvailabilityActionParam {
  uuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CheckVolumeSnapshotGroupAvailabilityResult {
  results?: any[];
}
