import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmInstanceInventory } from "./types";

@Injectable()
export class ResumeVmInstanceAction extends ActionAdvance {
  async call(
    params: ResumeVmInstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ResumeVmInstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ResumeVmInstanceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-instances/${params.uuid}/actions`,
      {
        resumeVmInstance: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ResumeVmInstanceResult>(
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

export interface ResumeVmInstanceActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ResumeVmInstanceResult {
  inventory?: VmInstanceInventory;
}
