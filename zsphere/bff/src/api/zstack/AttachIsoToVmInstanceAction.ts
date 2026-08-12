import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmInstanceInventory } from "./types";

@Injectable()
export class AttachIsoToVmInstanceAction extends ActionAdvance {
  async call(
    params: AttachIsoToVmInstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachIsoToVmInstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachIsoToVmInstanceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/vm-instances/${params.vmInstanceUuid}/iso/${params.isoUuid}`,
      {
        null: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<AttachIsoToVmInstanceResult>(
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

export interface AttachIsoToVmInstanceActionParam {
  vmInstanceUuid: string;
  isoUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachIsoToVmInstanceResult {
  inventory?: VmInstanceInventory;
}
