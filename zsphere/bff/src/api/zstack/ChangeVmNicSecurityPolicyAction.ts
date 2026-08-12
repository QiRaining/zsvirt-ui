import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmNicSecurityPolicyInventory } from "./types";

@Injectable()
export class ChangeVmNicSecurityPolicyAction extends ActionAdvance {
  async call(
    params: ChangeVmNicSecurityPolicyActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeVmNicSecurityPolicyResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeVmNicSecurityPolicyAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/security-groups/nics/${params.vmNicUuid}/security-policy/actions`,
      {
        changeVmNicSecurityPolicy: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeVmNicSecurityPolicyResult>(
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

export interface ChangeVmNicSecurityPolicyActionParam {
  vmNicUuid: string;
  ingressPolicy?: string;
  egressPolicy?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeVmNicSecurityPolicyResult {
  inventory?: VmNicSecurityPolicyInventory;
}
