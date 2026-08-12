import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { RoleInventory } from "./types";

@Injectable()
export class UpdateRoleAction extends ActionAdvance {
  async call(
    params: UpdateRoleActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateRoleResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateRoleAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/identities/roles/${params.uuid}/actions`,
      {
        updateRole: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateRoleResult>(
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

export interface UpdateRoleActionParam {
  uuid: string;
  name?: string;
  description?: string;
  createPolicies?: any[];
  clearPoliciesBeforeUpdate?: boolean;
  deletePolicies?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateRoleResult {
  inventory?: RoleInventory;
}
