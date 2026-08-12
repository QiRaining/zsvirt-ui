import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class CheckKVMHostConfigFileAction extends ActionAdvance {
  async call(
    params: CheckKVMHostConfigFileActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CheckHostConfigFileResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CheckKVMHostConfigFileAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/hosts/kvm/from-file/check`,
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
    return this.postAction<CheckHostConfigFileResult>(
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

export interface CheckKVMHostConfigFileActionParam {
  hostInfo: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CheckHostConfigFileResult {}
