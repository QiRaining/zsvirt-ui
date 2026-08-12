import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetSignatureServerEncryptPublicKeyAction extends QueryAdvance {
  async call(
    params: GetSignatureServerEncryptPublicKeyActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetSignatureServerEncryptPublicKeyResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetSignatureServerEncryptPublicKeyAction.name,
      params,
    );
    const paramString = this.genParamStringForGet(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/secret-resource-pool-token/signature-server-encrypt-public-key${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetSignatureServerEncryptPublicKeyResult>(
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

export interface GetSignatureServerEncryptPublicKeyActionParam {
  systemTags?: any[];
  userTags?: any[];
  requestIp?: string;
  timeout?: number;
}

export interface GetSignatureServerEncryptPublicKeyResult {
  publicKey?: string;
}
