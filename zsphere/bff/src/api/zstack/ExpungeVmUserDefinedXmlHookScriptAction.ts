import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ExpungeVmUserDefinedXmlHookScriptAction extends ActionAdvance {
  // 使用 zsHttpService

  async call(
    params: ExpungeVmUserDefinedXmlHookScriptActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ExpungeVmUserDefinedXmlHookScriptResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ExpungeVmUserDefinedXmlHookScriptAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "uuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/vm-instances/xml-hook-script/${params.uuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ExpungeVmUserDefinedXmlHookScriptResult>(
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

export interface ExpungeVmUserDefinedXmlHookScriptActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ExpungeVmUserDefinedXmlHookScriptResult {}
