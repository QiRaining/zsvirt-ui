import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SetVmStaticIpAction extends ActionAdvance {
  async call(
    params: SetVmStaticIpActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SetVmStaticIpResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SetVmStaticIpAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-instances/${params.vmInstanceUuid}/actions`,
      {
        setVmStaticIp: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<SetVmStaticIpResult>(
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

export interface SetVmStaticIpActionParam {
  vmInstanceUuid: string;
  l3NetworkUuid: string;
  ip?: string;
  ip6?: string;
  netmask?: string;
  gateway?: string;
  ipv6Gateway?: string;
  ipv6Prefix?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SetVmStaticIpResult {}
