import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { NvmeServerInventory } from "./types";

@Injectable()
export class RefreshNvmeServerAction extends ActionAdvance {
  async call(
    params: RefreshNvmeServerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RefreshNvmeServerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RefreshNvmeServerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/storage-devices/nvme/servers/${params.uuid}/actions`,
      {
        refreshNvmeServer: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RefreshNvmeServerResult>(
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

export interface RefreshNvmeServerActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RefreshNvmeServerResult {
  inventory?: NvmeServerInventory;
}
