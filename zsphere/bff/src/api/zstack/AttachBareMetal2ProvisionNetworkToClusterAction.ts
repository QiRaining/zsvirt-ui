import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BareMetal2ProvisionNetworkInventory } from "./types";

@Injectable()
export class AttachBareMetal2ProvisionNetworkToClusterAction extends ActionAdvance {
  async call(
    params: AttachBareMetal2ProvisionNetworkToClusterActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachBareMetal2ProvisionNetworkToClusterResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachBareMetal2ProvisionNetworkToClusterAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/baremetal2/clusters/${params.clusterUuid}/provision-networks/${params.networkUuid}`,
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
    return this.postAction<AttachBareMetal2ProvisionNetworkToClusterResult>(
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

export interface AttachBareMetal2ProvisionNetworkToClusterActionParam {
  clusterUuid: string;
  networkUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachBareMetal2ProvisionNetworkToClusterResult {
  inventory?: BareMetal2ProvisionNetworkInventory;
}
