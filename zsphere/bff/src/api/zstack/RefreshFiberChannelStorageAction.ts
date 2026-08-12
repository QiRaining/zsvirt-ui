import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RefreshFiberChannelStorageAction extends ActionAdvance {
  async call(
    params: RefreshFiberChannelStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RefreshFiberChannelStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RefreshFiberChannelStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/storage-devices/fiber-channel/controllers`,
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
    return this.postAction<RefreshFiberChannelStorageResult>(
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

export interface RefreshFiberChannelStorageActionParam {
  zoneUuid: string;
  scsiLunUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RefreshFiberChannelStorageResult {
  inventories?: any[];
}
