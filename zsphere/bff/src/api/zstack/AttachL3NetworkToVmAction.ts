import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmInstanceInventory } from "./types";

@Injectable()
export class AttachL3NetworkToVmAction extends ActionAdvance {
  async call(
    params: AttachL3NetworkToVmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachL3NetworkToVmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachL3NetworkToVmAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/vm-instances/${params.vmInstanceUuid}/l3-networks/${params.l3NetworkUuid}`,
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
    return this.postAction<AttachL3NetworkToVmResult>(
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

export interface AttachL3NetworkToVmActionParam {
  vmInstanceUuid: string;
  l3NetworkUuid: string;
  staticIp?: string;
  driverType?: string;
  customMac?: string;
  vmNicParams?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachL3NetworkToVmResult {
  inventory?: VmInstanceInventory;
}
