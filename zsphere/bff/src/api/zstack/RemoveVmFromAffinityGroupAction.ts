import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AffinityGroupInventory } from "./types";

@Injectable()
export class RemoveVmFromAffinityGroupAction extends ActionAdvance {
  async call(
    params: RemoveVmFromAffinityGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RemoveVmFromAffinityGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RemoveVmFromAffinityGroupAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "affinityGroupUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/affinity-groups/${params.affinityGroupUuid}/vm-instances${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RemoveVmFromAffinityGroupResult>(
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

export interface RemoveVmFromAffinityGroupActionParam {
  affinityGroupUuid: string;
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RemoveVmFromAffinityGroupResult {
  inventory?: AffinityGroupInventory;
}
