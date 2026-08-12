import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { NvmeServerInventory } from "./types";

@Injectable()
export class DetachNvmeServerFromClusterAction extends ActionAdvance {
  async call(
    params: DetachNvmeServerFromClusterActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachNvmeServerFromClusterResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachNvmeServerFromClusterAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "clusterUuid",
      "uuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/clusters/${params.clusterUuid}/storage-devices/nvme/servers/${params.uuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachNvmeServerFromClusterResult>(
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

export interface DetachNvmeServerFromClusterActionParam {
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

export interface DetachNvmeServerFromClusterResult {
  inventory?: NvmeServerInventory;
}
