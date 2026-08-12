import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SecurityGroupInventory } from "./types";

@Injectable()
export class AttachSecurityGroupToL3NetworkAction extends ActionAdvance {
  async call(
    params: AttachSecurityGroupToL3NetworkActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachSecurityGroupToL3NetworkResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachSecurityGroupToL3NetworkAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/security-groups/${params.securityGroupUuid}/l3-networks/${params.l3NetworkUuid}`,
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
    return this.postAction<AttachSecurityGroupToL3NetworkResult>(
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

export interface AttachSecurityGroupToL3NetworkActionParam {
  securityGroupUuid: string;
  l3NetworkUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachSecurityGroupToL3NetworkResult {
  inventory?: SecurityGroupInventory;
}
