import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetLicenseRecordsAction extends QueryAdvance {
  async call(
    params: GetLicenseRecordsActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetLicenseRecordsResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetLicenseRecordsAction.name,
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
      `/licenses/records${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetLicenseRecordsResult>(
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

export interface GetLicenseRecordsActionParam {
  limit?: number;
  start?: number;
  replyWithCount?: boolean;
  count?: boolean;
  sortBy?: string;
  sortDirection?: string;
  systemTags?: any[];
  userTags?: any[];
  requestIp?: string;
  timeout?: number;
}

export interface GetLicenseRecordsResult {
  inventories?: any[];
  total?: number;
}
