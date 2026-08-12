import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetCandidateVmNicForSecurityGroupAction extends QueryAdvance {
  async call(
    params: GetCandidateVmNicForSecurityGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetCandidateVmNicForSecurityGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetCandidateVmNicForSecurityGroupAction.name,
      params,
    );
    const paramString = this.genParamStringForGet(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "securityGroupUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/security-groups/${params.securityGroupUuid}/vm-instances/candidate-nics${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetCandidateVmNicForSecurityGroupResult>(
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

export interface GetCandidateVmNicForSecurityGroupActionParam {
  securityGroupUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetCandidateVmNicForSecurityGroupResult {
  inventories?: any[];
}
