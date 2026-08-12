import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VolumeInventory } from "./types";

@Injectable()
export class AttachDataVolumeToVmAction extends ActionAdvance {
  async call(
    params: AttachDataVolumeToVmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachDataVolumeToVmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachDataVolumeToVmAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/volumes/${params.volumeUuid}/vm-instances/${params.vmInstanceUuid}`,
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
    return this.postAction<AttachDataVolumeToVmResult>(
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

export interface AttachDataVolumeToVmActionParam {
  vmInstanceUuid: string;
  volumeUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachDataVolumeToVmResult {
  inventory?: VolumeInventory;
}
