import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";
import { HostNetworkInterfaceLldpRefInventory } from "./types";

@Injectable()
export class GetHostNetworkInterfaceLldpAction extends QueryAdvance {
  async call(
    params: GetHostNetworkInterfaceLldpActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetHostNetworkInterfaceLldpResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetHostNetworkInterfaceLldpAction.name,
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
      "interfaceUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/hostNetworkInterface/lldp/${params.interfaceUuid}/info${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetHostNetworkInterfaceLldpResult>(
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

export interface GetHostNetworkInterfaceLldpActionParam {
  interfaceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetHostNetworkInterfaceLldpResult {
  lldp?: HostNetworkInterfaceLldpRefInventory;
}
