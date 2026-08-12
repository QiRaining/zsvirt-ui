import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { TemplatedVmInstanceInventory } from "./types";

@Injectable()
export class UpdateTemplatedVmInstanceAction extends ActionAdvance {
  async call(
    params: UpdateTemplatedVmInstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateTemplatedVmInstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateTemplatedVmInstanceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-instances/templatedVmInstance/${params.uuid}/actions`,
      {
        updateTemplatedVmInstance: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateTemplatedVmInstanceResult>(
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

export interface UpdateTemplatedVmInstanceActionParam {
  uuid: string;
  name?: string;
  description?: string;
  cpuNum?: number;
  memorySize?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateTemplatedVmInstanceResult {
  inventory?: TemplatedVmInstanceInventory;
}
