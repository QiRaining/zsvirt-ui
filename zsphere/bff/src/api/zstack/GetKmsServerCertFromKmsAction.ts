import { Injectable } from "@nestjs/common";
import { ActionInfo } from "./base/types";

import { ActionAdvance } from "./base/action-advance";

@Injectable()
export class GetKmsServerCertFromKmsAction extends ActionAdvance {
  async call(
    params: GetKmsServerCertFromKmsActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetKmsServerCertFromKmsResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetKmsServerCertFromKmsAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/key-providers/kms/${params.uuid}/actions`,
      {
        getKmsServerCertFromKms: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetKmsServerCertFromKmsResult>(
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

export interface GetKmsServerCertFromKmsActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetKmsServerCertFromKmsResult {
  serverCertPem?: string;
  selfSigned?: boolean;
  serverCertInfo?: any;
}
