// @ts-nocheck
import { Injectable, Inject } from "@nestjs/common";
import * as _ from "lodash";

import { LongJobService } from "@/common/long-job/long-job.service";
import { ApplicationContext } from "@/cron/application.context.service";

import { genUuid } from "../../utils";
import { ActionBase } from "./base/action-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class DoLongjobAction extends ActionBase {
  @Inject() longJobService: LongJobService;

  async call(
    param: DoLongjobActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DoLongjobActionResult> {
    const info = _.cloneDeep(_info);
    const { actionId, taskId } = { ...info };
    if (!info.apiId) info.apiId = genUuid();
    let apiRecord;
    if (needRecord) {
      apiRecord = await this.recordStart(param, info, DoLongjobAction.name);
    }
    const {
      jobName,
      jobData,
      jobId: _jobId,
      resourceType,
      name,
      descripton = "",
      targetResourceUuid,
    } = { ...param };
    const jobId = _jobId || genUuid();
    let _r, _j;
    try {
      const doPromise = new Promise((r, j) => {
        _r = r;
        _j = j;
      });
      const context = ApplicationContext.getInstance();
      context.set(jobId, { resolve: _r, reject: _j });
      const submitPromise = this.longJobService.callInAction(
        jobName,
        jobData,
        jobId,
        actionId,
        taskId,
        resourceType,
        name,
        descripton,
        targetResourceUuid,
      );
      await submitPromise;
      const resp: any = await doPromise;
      context.delete(jobId);
      if (needRecord) {
        if (resp?.state === "fail") {
          throw new Error(resp?.error);
        } else {
          this.recordSuccess(resp, apiRecord);
        }
      }
      return resp;
    } catch (e) {
      if (needRecord) {
        let message = e?.message;
        try {
          message = JSON.parse(e?.message);
        } catch (error) {}
        await this.recordFailed(message, apiRecord);
      }
      throw e;
    }
  }
}

export interface DoLongjobActionParam {
  actionName: string;
  jobName: string;
  jobData: string;
  jobId?: string;
  resourceType: string;
  name?: string;
  description?: string;
  targetResourceUuid?: string;
}

export interface DoLongjobActionResult {
  inventory?: any;
}
