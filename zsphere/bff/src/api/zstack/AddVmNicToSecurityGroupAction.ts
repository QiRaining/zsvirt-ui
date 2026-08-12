import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class AddVmNicToSecurityGroupAction extends ActionAdvance {
  async call(
    params: AddVmNicToSecurityGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddVmNicToSecurityGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddVmNicToSecurityGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/security-groups/${params.securityGroupUuid}/vm-instances/nics`,
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
    return this.postAction<AddVmNicToSecurityGroupResult>(
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

export interface AddVmNicToSecurityGroupActionParam {
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

export interface AddVmNicToSecurityGroupResult {}
