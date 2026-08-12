import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class UpdateLicenseAction extends ActionAdvance {
  async call(
    params: UpdateLicenseActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateLicenseResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateLicenseAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/licenses/mn/${params.managementNodeUuid}/actions`,
      {
        updateLicense: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateLicenseResult>(
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

export interface UpdateLicenseActionParam {
  managementNodeUuid: string;
  license: string;
  additionSession?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateLicenseResult {
  results?: any[];
}
