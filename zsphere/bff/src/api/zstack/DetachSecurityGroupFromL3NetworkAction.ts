import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SecurityGroupInventory } from "./types";

@Injectable()
export class DetachSecurityGroupFromL3NetworkAction extends ActionAdvance {
  async call(
    params: DetachSecurityGroupFromL3NetworkActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachSecurityGroupFromL3NetworkResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachSecurityGroupFromL3NetworkAction.name,
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
      "securityGroupUuid",
      "l3NetworkUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/security-groups/${params.securityGroupUuid}/l3-networks/${params.l3NetworkUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachSecurityGroupFromL3NetworkResult>(
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

export interface DetachSecurityGroupFromL3NetworkActionParam {
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

export interface DetachSecurityGroupFromL3NetworkResult {
  inventory?: SecurityGroupInventory;
}
