import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmNicInventory } from "./types";

@Injectable()
export class ChangeVmNicNetworkAction extends ActionAdvance {
  async call(
    params: ChangeVmNicNetworkActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeVmNicNetworkResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeVmNicNetworkAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/vm-instances/nics/${params.vmNicUuid}/l3-networks/${params.destL3NetworkUuid}`,
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
    return this.postAction<ChangeVmNicNetworkResult>(
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

export interface ChangeVmNicNetworkActionParam {
  vmNicUuid: string;
  destL3NetworkUuid: string;
  vmNicParams?: string;
  staticIp?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeVmNicNetworkResult {
  inventory?: VmNicInventory;
}
