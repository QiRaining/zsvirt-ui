import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class DeleteVniRangeAction extends ActionAdvance {
  async call(
    params: DeleteVniRangeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DeleteVniRangeResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DeleteVniRangeAction.name,
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
      `/l2-networks/vxlan-pool/vni-ranges/${params.uuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DeleteVniRangeResult>(
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

export interface DeleteVniRangeActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DeleteVniRangeResult {}
