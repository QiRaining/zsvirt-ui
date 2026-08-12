import { Injectable } from "@nestjs/common";
import { ActionInfo } from "./base/types";

import { ActionAdvance } from "./base/action-advance";

@Injectable()
export class UploadKmsClientSignedCertAction extends ActionAdvance {
  async call(
    params: UploadKmsClientSignedCertActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UploadKmsClientSignedCertResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UploadKmsClientSignedCertAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/key-providers/kms/${params.uuid}/actions`,
      {
        uploadKmsClientSignedCert: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UploadKmsClientSignedCertResult>(
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

export interface UploadKmsClientSignedCertActionParam {
  uuid: string;
  signedClientCertPem: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UploadKmsClientSignedCertResult {
  inventory?: any;
}
