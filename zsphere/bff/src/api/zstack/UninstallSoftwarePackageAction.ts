import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class UninstallSoftwarePackageAction extends ActionAdvance {
  async call(
    params: UninstallSoftwarePackageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UninstallSoftwarePackageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UninstallSoftwarePackageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/software-package/${params.uuid}/actions`,
      {
        uninstallSoftwarePackage: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UninstallSoftwarePackageResult>(
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

export interface UninstallSoftwarePackageActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
  timeout?: number;
}

export interface UninstallSoftwarePackageResult {}
