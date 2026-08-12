import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { NvmeServerInventory } from "./types";

@Injectable()
export class AddNvmeServerAction extends ActionAdvance {
  async call(
    params: AddNvmeServerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddNvmeServerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddNvmeServerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/storage-devices/nvme/servers`,
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
    return this.postAction<AddNvmeServerResult>(
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

export interface AddNvmeServerActionParam {
  name?: string;
  ip: string;
  port?: number;
  transport: string;
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

export interface AddNvmeServerResult {
  inventory?: NvmeServerInventory;
}
