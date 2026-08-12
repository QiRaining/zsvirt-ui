import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetDirectoryUsageAction extends QueryAdvance {
  async call(
    params: GetDirectoryUsageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetDirectoryUsageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetDirectoryUsageAction.name,
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
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/software-package/directory/usage${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetDirectoryUsageResult>(
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

export interface GetDirectoryUsageActionParam {
  managementNodeUuid: string;
  directoryPath: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
  timeout?: number;
}

export interface GetDirectoryUsageResult {
  totalCapacity?: number;
  availableCapacity?: number;
}
