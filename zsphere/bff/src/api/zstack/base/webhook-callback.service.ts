import { Injectable } from "@nestjs/common";
const globalAny: any = global;
globalAny.webhookCallbackServiceCallList = [];
@Injectable()
export class WebhookCallbackService {
  private callList = globalAny.webhookCallbackServiceCallList;

  set(actionId, resolve, reject) {
    if (this.callList[actionId]) {
      Object.assign(this.callList[actionId], { resolve, reject });
    } else {
      this.callList[actionId] = {
        resolve,
        reject,
      };
    }
  }

  get(actionId) {
    return this.callList?.[actionId];
  }

  update(actionId, extraInfo) {
    if (this.callList[actionId]) {
      Object.assign(this.callList[actionId], extraInfo);
    } else {
      this.callList[actionId] = extraInfo;
    }
  }

  remove(actionId) {
    delete this.callList[actionId];
  }

  success(actionId, resp) {
    const call = this.callList[actionId];

    if (!call || !call.resolve) {
      return;
    }
    call.resolve(resp);
    delete this.callList[actionId];
  }

  fail(actionId, resp) {
    const call = this.callList[actionId];
    if (!call || !call.reject) {
      return;
    }
    if (resp) {
      resp.name = "apiError";
    } else {
      resp = { name: "apiError" };
    }
    call.reject(resp);
    delete this.callList[actionId];
  }
}
