import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { IscsiServerInventory } from "./types";

@Injectable()
export class AttachIscsiServerToClusterAction extends ActionAdvance {
  async call(
    params: AttachIscsiServerToClusterActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachIscsiServerToClusterResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachIscsiServerToClusterAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/clusters/${params.clusterUuid}/storage-devices/iscsi/servers/${params.uuid}`,
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
    return this.postAction<AttachIscsiServerToClusterResult>(
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

export interface AttachIscsiServerToClusterActionParam {
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

export interface AttachIscsiServerToClusterResult {
  inventory?: IscsiServerInventory;
}
