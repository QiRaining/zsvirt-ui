import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RevertVolumeFromSnapshotAction extends ActionAdvance {
  async call(
    params: RevertVolumeFromSnapshotActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RevertVolumeFromSnapshotResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RevertVolumeFromSnapshotAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/volume-snapshots/${params.uuid}/actions`,
      {
        revertVolumeFromSnapshot: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RevertVolumeFromSnapshotResult>(
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

export interface RevertVolumeFromSnapshotActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RevertVolumeFromSnapshotResult {}
