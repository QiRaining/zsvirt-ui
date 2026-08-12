import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class UpdateVmPriorityAction extends ActionAdvance {
  async call(
    params: UpdateVmPriorityActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateVmPriorityResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateVmPriorityAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-instances/${params.uuid}/actions`,
      {
        updateVmPriority: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateVmPriorityResult>(
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

export interface UpdateVmPriorityActionParam {
  uuid: string;
  priority: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateVmPriorityResult {}
