import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RefreshNvmeTargetAction extends ActionAdvance {
  async call(
    params: RefreshNvmeTargetActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RefreshNvmeTargetResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RefreshNvmeTargetAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/storage-devices/nvme/controllers`,
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
    return this.postAction<RefreshNvmeTargetResult>(
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

export interface RefreshNvmeTargetActionParam {
  zoneUuid: string;
  nvmeLunUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RefreshNvmeTargetResult {
  inventories?: any[];
}
