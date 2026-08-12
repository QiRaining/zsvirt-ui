import { Injectable } from "@nestjs/common";
import { ActionInfo } from "./base/types";

import { ActionAdvance } from "./base/action-advance";

@Injectable()
export class UploadKmsClientCsrAction extends ActionAdvance {
  async call(
    params: UploadKmsClientCsrActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UploadKmsClientCsrResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UploadKmsClientCsrAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/key-providers/kms/${params.uuid}/actions`,
      {
        uploadKmsClientCsr: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UploadKmsClientCsrResult>(
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

export interface UploadKmsClientCsrActionParam {
  uuid: string;
  csrPem: string;
  csrKeyPem: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UploadKmsClientCsrResult {
  inventory?: any;
}
