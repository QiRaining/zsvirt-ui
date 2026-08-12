import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class UpdateZStoneClusterConfigAction extends ActionAdvance {
  async call(
    params: UpdateZStoneClusterConfigActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateZStoneClusterConfigResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateZStoneClusterConfigAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zstone-plugin/config/cluster`,
      {
        updateZStoneClusterConfig: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateZStoneClusterConfigResult>(
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

export interface UpdateZStoneClusterConfigActionParam {
  uuid: string;
  softwarePackageUuid: string;
  clusterName: string;
  managementIp?: string;
  chronyIp: string;
  publicNetworkCidr: string;
  clusterNetworkCidr: string;
  managementNetworkCidr: string;
  force?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateZStoneClusterConfigResult {}
