import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { LicenseInventory } from "./types";

@Injectable()
export class ReloadLicenseAction extends ActionAdvance {
  async call(
    params: ReloadLicenseActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ReloadLicenseResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ReloadLicenseAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/licenses/actions`,
      {
        reloadLicense: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ReloadLicenseResult>(
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

export interface ReloadLicenseActionParam {
  managementNodeUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ReloadLicenseResult {
  inventory?: LicenseInventory;
}
