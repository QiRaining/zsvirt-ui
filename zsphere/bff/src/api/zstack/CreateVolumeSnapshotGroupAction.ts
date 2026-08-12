import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VolumeSnapshotGroupInventory } from "./types";

@Injectable()
export class CreateVolumeSnapshotGroupAction extends ActionAdvance {
  async call(
    params: CreateVolumeSnapshotGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateVolumeSnapshotGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateVolumeSnapshotGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/volume-snapshots/group`,
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
    return this.postAction<CreateVolumeSnapshotGroupResult>(
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

export interface CreateVolumeSnapshotGroupActionParam {
  rootVolumeUuid: string;
  name: string;
  description?: string;
  withMemory?: boolean;
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

export interface CreateVolumeSnapshotGroupResult {
  inventory?: VolumeSnapshotGroupInventory;
}
