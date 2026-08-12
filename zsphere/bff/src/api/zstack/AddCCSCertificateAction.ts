import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { CCSCertificateInventory } from "./types";

@Injectable()
export class AddCCSCertificateAction extends ActionAdvance {
  async call(
    params: AddCCSCertificateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddCCSCertificateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddCCSCertificateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/crypto/ccs-certificate/add`,
      {
        addCCSCertificate: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<AddCCSCertificateResult>(
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

export interface AddCCSCertificateActionParam {
  certificate: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AddCCSCertificateResult {
  inventory?: CCSCertificateInventory;
}
