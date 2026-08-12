import * as cron from 'node-cron'

let zwatchMessagesMap

export class ZwatchConvergenceManager {
  private task: cron.ScheduledTask | null = null
  private pub

  constructor(cronExpression: string, pub: any) {
    this.task = cron.schedule(cronExpression, this.zwatchMessageSender, {
      scheduled: false
    })
    this.pub = pub
    if (!zwatchMessagesMap) {
      zwatchMessagesMap = new Map()
    }
  }

  push(payload) {
    if (payload?.payload?.ALARM_UUID || payload?.payload?.EVENT_SUBSCRIPTION_UUID) {
      const id = `${payload.sessionId}-${
        payload.payload?.ALARM_UUID || payload.payload?.EVENT_SUBSCRIPTION_UUID
      }`
      const body = zwatchMessagesMap.get(id) ?? []
      if (zwatchMessagesMap.size === 0) {
        this.task.start()
      }
      zwatchMessagesMap.set(id, body.concat(payload))
    } else {
      this.pub.publish(`ZWatchConvergence-${payload.sessionId}`, {
        listenZWatchConvergence: payload
      })
    }
  }

  start(): void {
    this.task.start()
  }

  stop(): void {
    this.task.stop()
  }

  zwatchMessageSender = () => {
    if (zwatchMessagesMap.size === 0) {
      this.task.stop()
      return
    }
    zwatchMessagesMap.forEach((values, id) => {
      const payload = values?.[0]?.payload
      payload.RESOURCES = values.map(it => ({
        dataUuid: it.payload.ALARM_DATA_UUID || it.payload.EVENT_DATA_UUID,
        name: it.payload.ALARM_RESOURCE_NAME || it.payload.EVENT_RESOURCE_NAME,
        uuid: it.payload.ALARM_RESOURCE_ID || it.payload.EVENT_RESOURCE_ID
      }))
      this.pub.publish(`ZWatchConvergence-${values?.[0].sessionId}`, {
        listenZWatchConvergence: {
          sessionId: values?.[0].sessionId,
          payload: JSON.stringify(payload)
        }
      })
      zwatchMessagesMap.delete(id)
    })
  }
}
