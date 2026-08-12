import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmInstanceInventory } from "./types";

@Injectable()
export class UpdateVmInstanceAction extends ActionAdvance {
  async call(
    params: UpdateVmInstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateVmInstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateVmInstanceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-instances/${params.uuid}/actions`,
      {
        updateVmInstance: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateVmInstanceResult>(
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

export interface UpdateVmInstanceActionParam {
  uuid: string;
  name?: string;
  description?: string;
  state?: string;
  defaultL3NetworkUuid?: string;
  platform?: string;
  cpuNum?: number;
  memorySize?: number;
  reservedMemorySize?: number;
  guestOsType?: string;
  allocatorStrategy?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateVmInstanceResult {
  inventory?: VmInstanceInventory;
}
