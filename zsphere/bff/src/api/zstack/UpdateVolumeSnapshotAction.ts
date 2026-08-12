import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VolumeSnapshotInventory } from "./types";

@Injectable()
export class UpdateVolumeSnapshotAction extends ActionAdvance {
  async call(
    params: UpdateVolumeSnapshotActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateVolumeSnapshotResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateVolumeSnapshotAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/volume-snapshots/${params.uuid}/actions`,
      {
        updateVolumeSnapshot: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateVolumeSnapshotResult>(
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

export interface UpdateVolumeSnapshotActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateVolumeSnapshotResult {
  inventory?: VolumeSnapshotInventory;
}
