import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { TemplatedVmInstanceInventory } from "./types";

@Injectable()
export class ConvertVmInstanceToTemplatedVmInstanceAction extends ActionAdvance {
  async call(
    params: ConvertVmInstanceToTemplatedVmInstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ConvertVmInstanceToTemplatedVmInstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ConvertVmInstanceToTemplatedVmInstanceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/vm-instances/${params.vmInstanceUuid}/convert-to-templatedVmInstance`,
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
    return this.postAction<ConvertVmInstanceToTemplatedVmInstanceResult>(
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

export interface ConvertVmInstanceToTemplatedVmInstanceActionParam {
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ConvertVmInstanceToTemplatedVmInstanceResult {
  inventory?: TemplatedVmInstanceInventory;
}
