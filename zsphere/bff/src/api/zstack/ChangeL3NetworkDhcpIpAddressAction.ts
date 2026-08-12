import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ChangeL3NetworkDhcpIpAddressAction extends ActionAdvance {
  async call(
    params: ChangeL3NetworkDhcpIpAddressActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeL3NetworkDhcpIpAddressResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeL3NetworkDhcpIpAddressAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/l3-networks/${params.l3NetworkUuid}/dhcp-ip`,
      {
        changeL3NetworkDhcpIpAddress: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeL3NetworkDhcpIpAddressResult>(
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

export interface ChangeL3NetworkDhcpIpAddressActionParam {
  l3NetworkUuid: string;
  dhcpServerIp?: string;
  dhcpv6ServerIp?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeL3NetworkDhcpIpAddressResult {
  dhcpServerIp?: string;
  dhcpv6ServerIp?: string;
}
