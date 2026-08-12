import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RevertVmFromSnapshotGroupAction extends ActionAdvance {
  async call(
    params: RevertVmFromSnapshotGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RevertVmFromSnapshotGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RevertVmFromSnapshotGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/volume-snapshots/group/${params.uuid}/actions`,
      {
        revertVmFromSnapshotGroup: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RevertVmFromSnapshotGroupResult>(
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

export interface RevertVmFromSnapshotGroupActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RevertVmFromSnapshotGroupResult {
  results?: any[];
}
