import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetHostNUMATopologyAction extends ActionAdvance {
  async call(
    params: GetHostNUMATopologyActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetHostNUMATopologyResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetHostNUMATopologyAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/hosts/${params.uuid}/numa`,
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
    return this.postAction<GetHostNUMATopologyResult>(
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

export interface GetHostNUMATopologyActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetHostNUMATopologyResult {
  name?: string;
  uuid?: string;
  topology?: any;
}
