import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SecurityMachineDetectSyncAction extends ActionAdvance {
  async call(
    params: SecurityMachineDetectSyncActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SecurityMachineDetectSyncResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SecurityMachineDetectSyncAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/security-machine/${params.uuid}/detect/sync/actions`,
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
    return this.postAction<SecurityMachineDetectSyncResult>(
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

export interface SecurityMachineDetectSyncActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SecurityMachineDetectSyncResult {}
