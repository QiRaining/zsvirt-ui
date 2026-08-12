import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SetVmDnsAction extends ActionAdvance {
  async call(
    params: SetVmDnsActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SetVmDnsResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SetVmDnsAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-instances/${params.vmInstanceUuid}/actions`,
      {
        setVmDns: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<SetVmDnsResult>(
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

export interface SetVmDnsActionParam {
  vmInstanceUuid: string;
  vmNicUuid?: string;
  dnsList: any[];
  ipVersion?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SetVmDnsResult {
  inventories?: any[];
}
