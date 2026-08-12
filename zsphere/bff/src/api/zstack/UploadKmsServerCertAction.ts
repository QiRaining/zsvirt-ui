import { Injectable } from "@nestjs/common";
import { ActionInfo } from "./base/types";

import { ActionAdvance } from "./base/action-advance";

@Injectable()
export class UploadKmsServerCertAction extends ActionAdvance {
  async call(
    params: UploadKmsServerCertActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UploadKmsServerCertResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UploadKmsServerCertAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/key-providers/kms/${params.uuid}/actions`,
      {
        uploadKmsServerCert: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UploadKmsServerCertResult>(
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

export interface UploadKmsServerCertActionParam {
  uuid: string;
  serverCertPem: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UploadKmsServerCertResult {
  inventory?: any;
}
