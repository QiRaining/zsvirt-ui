import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ScsiLunClusterStatusInventory } from "./types";

@Injectable()
export class CheckScsiLunClusterStatusAction extends ActionAdvance {
  async call(
    params: CheckScsiLunClusterStatusActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CheckScsiLunClusterStatusResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CheckScsiLunClusterStatusAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/storage-devices/scsi-lun/${params.uuid}/cluster/${params.clusterUuid}`,
      {
        checkScsiLunClusterStatus: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<CheckScsiLunClusterStatusResult>(
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

export interface CheckScsiLunClusterStatusActionParam {
  uuid: string;
  clusterUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CheckScsiLunClusterStatusResult {
  inventory?: ScsiLunClusterStatusInventory;
}
