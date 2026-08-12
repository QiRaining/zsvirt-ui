import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SshKeyPairInventory } from "./types";

@Injectable()
export class AttachSshKeyPairToVmInstanceAction extends ActionAdvance {
  async call(
    params: AttachSshKeyPairToVmInstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachSshKeyPairToVmInstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachSshKeyPairToVmInstanceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/ssh-key-pair/${params.sshKeyPairUuid}/vm-instance/${params.vmInstanceUuid}`,
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
    return this.postAction<AttachSshKeyPairToVmInstanceResult>(
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

export interface AttachSshKeyPairToVmInstanceActionParam {
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

export interface AttachSshKeyPairToVmInstanceResult {
  inventory?: SshKeyPairInventory;
}
