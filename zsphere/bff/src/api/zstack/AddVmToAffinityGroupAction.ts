import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AffinityGroupInventory } from "./types";

@Injectable()
export class AddVmToAffinityGroupAction extends ActionAdvance {
  async call(
    params: AddVmToAffinityGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddVmToAffinityGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddVmToAffinityGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/affinity-groups/${params.affinityGroupUuid}/vm-instances/${params.uuid}`,
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
    return this.postAction<AddVmToAffinityGroupResult>(
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

export interface AddVmToAffinityGroupActionParam {
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

export interface AddVmToAffinityGroupResult {
  inventory?: AffinityGroupInventory;
}
