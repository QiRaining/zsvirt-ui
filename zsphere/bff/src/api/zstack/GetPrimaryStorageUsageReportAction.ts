import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetPrimaryStorageUsageReportAction extends QueryAdvance {
  async call(
    params: GetPrimaryStorageUsageReportActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetPrimaryStorageUsageReportResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetPrimaryStorageUsageReportAction.name,
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
      "primaryStorageUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/primary-storage/${params.primaryStorageUuid}/usage/report${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetPrimaryStorageUsageReportResult>(
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

export interface GetPrimaryStorageUsageReportActionParam {
  primaryStorageUuid: string;
  uris?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetPrimaryStorageUsageReportResult {
  uriUsageForecast?: any;
  usageReport?: any;
}
