import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SecurityGroupInventory } from "./types";

@Injectable()
export class CreateSecurityGroupAction extends ActionAdvance {
  async call(
    params: CreateSecurityGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateSecurityGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateSecurityGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/security-groups`,
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
    return this.postAction<CreateSecurityGroupResult>(
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

export interface CreateSecurityGroupActionParam {
  name: string;
  description?: string;
  ipVersion?: number;
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

export interface CreateSecurityGroupResult {
  inventory?: SecurityGroupInventory;
}
