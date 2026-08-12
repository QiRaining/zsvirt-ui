import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SshKeyPairInventory } from "./types";

@Injectable()
export class CreateSshKeyPairAction extends ActionAdvance {
  async call(
    params: CreateSshKeyPairActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateSshKeyPairResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateSshKeyPairAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/ssh-key-pair`,
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
    return this.postAction<CreateSshKeyPairResult>(
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

export interface CreateSshKeyPairActionParam {
  name: string;
  description?: string;
  publicKey: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CreateSshKeyPairResult {
  inventory?: SshKeyPairInventory;
}
