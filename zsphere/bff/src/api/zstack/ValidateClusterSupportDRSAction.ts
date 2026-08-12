import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class ValidateClusterSupportDRSAction extends QueryAdvance {
  async call(
    params: ValidateClusterSupportDRSActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ValidateClusterSupportDRSResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ValidateClusterSupportDRSAction.name,
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
      "clusterUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/clusters/${params.clusterUuid}/drs/valid${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ValidateClusterSupportDRSResult>(
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

export interface ValidateClusterSupportDRSActionParam {
  clusterUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ValidateClusterSupportDRSResult {
  supported?: boolean;
  reason?: any;
}
