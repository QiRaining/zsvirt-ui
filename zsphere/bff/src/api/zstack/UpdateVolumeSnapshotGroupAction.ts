import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VolumeSnapshotGroupInventory } from "./types";

@Injectable()
export class UpdateVolumeSnapshotGroupAction extends ActionAdvance {
  async call(
    params: UpdateVolumeSnapshotGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateVolumeSnapshotGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateVolumeSnapshotGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/volume-snapshots/group/${params.uuid}/actions`,
      {
        updateVolumeSnapshotGroup: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateVolumeSnapshotGroupResult>(
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

export interface UpdateVolumeSnapshotGroupActionParam {
  name?: string;
  description?: string;
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateVolumeSnapshotGroupResult {
  inventory?: VolumeSnapshotGroupInventory;
}
