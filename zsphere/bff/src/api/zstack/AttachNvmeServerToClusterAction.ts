import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { NvmeServerInventory } from "./types";

@Injectable()
export class AttachNvmeServerToClusterAction extends ActionAdvance {
  async call(
    params: AttachNvmeServerToClusterActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachNvmeServerToClusterResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachNvmeServerToClusterAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/clusters/${params.clusterUuid}/storage-devices/nvme/servers/${params.uuid}`,
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
    return this.postAction<AttachNvmeServerToClusterResult>(
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

export interface AttachNvmeServerToClusterActionParam {
  uuid: string;
  clusterUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachNvmeServerToClusterResult {
  inventory?: NvmeServerInventory;
}
