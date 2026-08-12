import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetVolumeSnapshotSizeAction extends ActionAdvance {
  async call(
    params: GetVolumeSnapshotSizeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetVolumeSnapshotSizeResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetVolumeSnapshotSizeAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/volume-snapshots/${params.uuid}/actions`,
      {
        getVolumeSnapshotSize: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetVolumeSnapshotSizeResult>(
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

export interface GetVolumeSnapshotSizeActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetVolumeSnapshotSizeResult {
  size?: number;
  actualSize?: number;
}
