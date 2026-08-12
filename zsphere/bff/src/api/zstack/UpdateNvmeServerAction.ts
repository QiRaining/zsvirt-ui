import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { NvmeServerInventory } from "./types";

@Injectable()
export class UpdateNvmeServerAction extends ActionAdvance {
  async call(
    params: UpdateNvmeServerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateNvmeServerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateNvmeServerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/storage-devices/nvme/servers/${params.uuid}/actions`,
      {
        updateNvmeServer: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateNvmeServerResult>(
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

export interface UpdateNvmeServerActionParam {
  uuid: string;
  name?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateNvmeServerResult {
  inventory?: NvmeServerInventory;
}
