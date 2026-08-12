import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetLicenseUKeyStatusAction extends ActionAdvance {
  async call(
    params: GetLicenseUKeyStatusActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetLicenseUKeyStatusResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetLicenseUKeyStatusAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/licenses/actions`,
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
    return this.postAction<GetLicenseUKeyStatusResult>(
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

export interface GetLicenseUKeyStatusActionParam {
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetLicenseUKeyStatusResult {
  inventories?: any[];
}
