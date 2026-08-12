import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { TemplatedVmInstanceInventory } from "./types";

@Injectable()
export class CreateTemplatedVmInstanceFromVmInstanceAction extends ActionAdvance {
  async call(
    params: CreateTemplatedVmInstanceFromVmInstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateTemplatedVmInstanceFromVmInstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateTemplatedVmInstanceFromVmInstanceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/vm-instances/${params.vmInstanceUuid}/create-templated-vmInstance`,
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
    return this.postAction<CreateTemplatedVmInstanceFromVmInstanceResult>(
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

export interface CreateTemplatedVmInstanceFromVmInstanceActionParam {
  name: string;
  vmInstanceUuid: string;
  clusterUuid?: string;
  hostUuid?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CreateTemplatedVmInstanceFromVmInstanceResult {
  templatedVmInstanceInventory?: TemplatedVmInstanceInventory;
}
