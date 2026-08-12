import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VolumeSnapshotInventory } from "./types";

@Injectable()
export class CreateVolumeSnapshotAction extends ActionAdvance {
  async call(
    params: CreateVolumeSnapshotActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateVolumeSnapshotResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateVolumeSnapshotAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/volumes/${params.volumeUuid}/volume-snapshots`,
      {
        params: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<CreateVolumeSnapshotResult>(
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

export interface CreateVolumeSnapshotActionParam {
  volumeUuid: string;
  name: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CreateVolumeSnapshotResult {
  inventory?: VolumeSnapshotInventory;
}
