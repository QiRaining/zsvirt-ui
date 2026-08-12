import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class InstallSoftwarePackageAction extends ActionAdvance {
  async call(
    params: InstallSoftwarePackageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<InstallSoftwarePackageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      InstallSoftwarePackageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/software-package/install/${params.uuid}/actions`,
      {
        installSoftwarePackage: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<InstallSoftwarePackageResult>(
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

export interface InstallSoftwarePackageActionParam {
  uuid: string;
  config?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
  timeout?: number;
}

export interface InstallSoftwarePackageResult {
  inventory?: any;
}
