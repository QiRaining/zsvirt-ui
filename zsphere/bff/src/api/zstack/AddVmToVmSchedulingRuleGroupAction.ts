import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class AddVmToVmSchedulingRuleGroupAction extends ActionAdvance {
  async call(
    params: AddVmToVmSchedulingRuleGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddVmToVmSchedulingRuleGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddVmToVmSchedulingRuleGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/vmSchedulingRuleGroup/${params.vmGroupUuid}/vmInstance/${params.vmUuid}`,
      {},
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<AddVmToVmSchedulingRuleGroupResult>(
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

export interface AddVmToVmSchedulingRuleGroupActionParam {
  vmGroupUuid: string;
  vmUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AddVmToVmSchedulingRuleGroupResult {}
