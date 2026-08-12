import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class UpdateZceXClusterConfigAction extends ActionAdvance {
  async call(
    params: UpdateZceXClusterConfigActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateZceXClusterConfigResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateZceXClusterConfigAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zce-x-plugin/config/cluster`,
      {
        updateZceXClusterConfig: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateZceXClusterConfigResult>(
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

export interface UpdateZceXClusterConfigActionParam {
  uuid: string;
  softwarePackageUuid: string;
  managementIp?: string;
  managementNetworkCidr: string;
  publicNetworkCidr: string;
  clusterNetworkCidr: string;
  gatewayNetworkCidr?: string;
  otherManagementIp: any[];
  otherStorageIp?: any[];
  username?: string;
  password?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateZceXClusterConfigResult {
  initSuccess?: boolean;
  tokenCreated?: boolean;
}
