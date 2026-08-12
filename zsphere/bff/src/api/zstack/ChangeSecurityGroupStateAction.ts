import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SecurityGroupInventory } from "./types";

@Injectable()
export class ChangeSecurityGroupStateAction extends ActionAdvance {
  async call(
    params: ChangeSecurityGroupStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeSecurityGroupStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeSecurityGroupStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/security-groups/${params.uuid}/actions`,
      {
        changeSecurityGroupState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeSecurityGroupStateResult>(
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

export interface ChangeSecurityGroupStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeSecurityGroupStateResult {
  inventory?: SecurityGroupInventory;
}
