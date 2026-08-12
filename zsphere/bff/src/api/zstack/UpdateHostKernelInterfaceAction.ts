import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { HostKernelInterfaceInventory } from "./types";

@Injectable()
export class UpdateHostKernelInterfaceAction extends ActionAdvance {
  async call(
    params: UpdateHostKernelInterfaceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateHostKernelInterfaceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateHostKernelInterfaceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/l3-networks/kernel-interfaces/${params.uuid}/actions`,
      {
        updateHostKernelInterface: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateHostKernelInterfaceResult>(
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

export interface UpdateHostKernelInterfaceActionParam {
  uuid: string;
  name?: string;
  description?: string;
  requiredIp?: string;
  netmask?: string;
  trafficTypes?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateHostKernelInterfaceResult {
  inventory?: HostKernelInterfaceInventory;
}
