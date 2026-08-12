import { Injectable } from "@nestjs/common";
import { ActionInfo } from "./base/types";

import { ActionAdvance } from "./base/action-advance";

@Injectable()
export class UploadKmsClientIdentityAction extends ActionAdvance {
  async call(
    params: UploadKmsClientIdentityActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UploadKmsClientIdentityResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UploadKmsClientIdentityAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/key-providers/kms/${params.uuid}/actions`,
      {
        uploadKmsClientIdentity: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UploadKmsClientIdentityResult>(
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

export interface UploadKmsClientIdentityActionParam {
  uuid: string;
  identityType: string;
  kmsClientCertPem: string;
  kmsClientKeyPem: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UploadKmsClientIdentityResult {
  inventory?: any;
}
