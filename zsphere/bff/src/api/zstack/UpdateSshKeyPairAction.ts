import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SshKeyPairInventory } from "./types";

@Injectable()
export class UpdateSshKeyPairAction extends ActionAdvance {
  async call(
    params: UpdateSshKeyPairActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSshKeyPairResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateSshKeyPairAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/ssh-key-pair/${params.uuid}/actions`,
      {
        updateSshKeyPair: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateSshKeyPairResult>(
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

export interface UpdateSshKeyPairActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateSshKeyPairResult {
  inventory?: SshKeyPairInventory;
}
