import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class DeleteVmNicFromSecurityGroupAction extends ActionAdvance {
  async call(
    params: DeleteVmNicFromSecurityGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DeleteVmNicFromSecurityGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DeleteVmNicFromSecurityGroupAction.name,
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
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/security-groups/${params.securityGroupUuid}/vm-instances/nics${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DeleteVmNicFromSecurityGroupResult>(
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

export interface DeleteVmNicFromSecurityGroupActionParam {
  securityGroupUuid: string;
  vmNicUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DeleteVmNicFromSecurityGroupResult {}
