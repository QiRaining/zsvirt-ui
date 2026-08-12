import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class DetachSshKeyPairFromVmInstanceAction extends ActionAdvance {
  async call(
    params: DetachSshKeyPairFromVmInstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachSshKeyPairFromVmInstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachSshKeyPairFromVmInstanceAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "sshKeyPairUuid",
      "vmInstanceUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/ssh-key-pair/${params.sshKeyPairUuid}/vm-instance/${params.vmInstanceUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachSshKeyPairFromVmInstanceResult>(
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

export interface DetachSshKeyPairFromVmInstanceActionParam {
  vmInstanceUuid: string;
  sshKeyPairUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DetachSshKeyPairFromVmInstanceResult {}
