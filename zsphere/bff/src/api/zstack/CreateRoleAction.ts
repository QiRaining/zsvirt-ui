import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { RoleInventory } from "./types";

@Injectable()
export class CreateRoleAction extends ActionAdvance {
  async call(
    params: CreateRoleActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateRoleResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateRoleAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/identities/roles`,
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
    return this.postAction<CreateRoleResult>(
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

export interface CreateRoleActionParam {
  name: string;
  description?: string;
  policies?: any[];
  baseOnRole?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CreateRoleResult {
  inventory?: RoleInventory;
}
