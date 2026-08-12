import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class UpdateResourceConfigsAction extends ActionAdvance {
  async call(
    params: UpdateResourceConfigsActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateResourceConfigsResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateResourceConfigsAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/resource-configurations/${params.resourceUuid}/resource-configs/actions`,
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
    return this.postAction<UpdateResourceConfigsResult>(
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

export interface UpdateResourceConfigsActionParam {
  resourceUuid: string;
  resourceConfigs: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateResourceConfigsResult {
  inventories?: any[];
}
