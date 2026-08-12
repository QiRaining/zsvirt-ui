import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SshPrivateKeyPairInventory } from "./types";

@Injectable()
export class GenerateSshKeyPairAction extends ActionAdvance {
  async call(
    params: GenerateSshKeyPairActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GenerateSshKeyPairResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GenerateSshKeyPairAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/ssh-key-pair/generate`,
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
    return this.postAction<GenerateSshKeyPairResult>(
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

export interface GenerateSshKeyPairActionParam {
  name: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GenerateSshKeyPairResult {
  inventory?: SshPrivateKeyPairInventory;
}
