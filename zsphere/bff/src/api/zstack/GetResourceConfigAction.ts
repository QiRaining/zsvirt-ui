import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetResourceConfigAction extends QueryAdvance {
  async call(
    params: GetResourceConfigActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetResourceConfigResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetResourceConfigAction.name,
      params,
    );
    const paramString = this.genParamStringForGet(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "resourceUuid",
      "category",
      "name",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/resource-configurations/${params.resourceUuid}/${params.category}/${params.name}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetResourceConfigResult>(
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

export interface GetResourceConfigActionParam {
  category: string;
  name: string;
  resourceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetResourceConfigResult {
  value?: string;
  effectiveConfigs?: any[];
}
