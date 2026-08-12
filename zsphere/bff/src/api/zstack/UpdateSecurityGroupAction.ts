import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SecurityGroupInventory } from "./types";

@Injectable()
export class UpdateSecurityGroupAction extends ActionAdvance {
  async call(
    params: UpdateSecurityGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSecurityGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateSecurityGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/security-groups/${params.uuid}/actions`,
      {
        updateSecurityGroup: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateSecurityGroupResult>(
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

export interface UpdateSecurityGroupActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateSecurityGroupResult {
  inventory?: SecurityGroupInventory;
}
