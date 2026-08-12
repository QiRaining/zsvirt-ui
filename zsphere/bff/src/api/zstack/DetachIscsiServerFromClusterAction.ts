import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { IscsiServerInventory } from "./types";

@Injectable()
export class DetachIscsiServerFromClusterAction extends ActionAdvance {
  async call(
    params: DetachIscsiServerFromClusterActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachIscsiServerFromClusterResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachIscsiServerFromClusterAction.name,
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
      `/clusters/${params.clusterUuid}/storage-devices/iscsi/servers/${params.uuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachIscsiServerFromClusterResult>(
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

export interface DetachIscsiServerFromClusterActionParam {
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

export interface DetachIscsiServerFromClusterResult {
  inventory?: IscsiServerInventory;
}
