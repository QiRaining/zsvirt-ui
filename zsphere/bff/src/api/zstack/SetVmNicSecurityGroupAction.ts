import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SetVmNicSecurityGroupAction extends ActionAdvance {
  async call(
    params: SetVmNicSecurityGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SetVmNicSecurityGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SetVmNicSecurityGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/security-groups/nics/${params.vmNicUuid}/actions`,
      {
        setVmNicSecurityGroup: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<SetVmNicSecurityGroupResult>(
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

export interface SetVmNicSecurityGroupActionParam {
  vmNicUuid: string;
  refs: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SetVmNicSecurityGroupResult {
  inventory?: any[];
}
