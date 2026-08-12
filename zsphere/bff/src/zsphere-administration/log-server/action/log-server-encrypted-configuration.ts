import {
  AddLogServerAction,
  AddLogServerActionParam,
  AddLogServerResult
} from '@/api/zstack/AddLogServerAction'
import { ActionInfo } from '@/api/zstack/base/types'
import { Decrypt } from '@/utils/aesCipher'

interface LogServerConfigurationEnvelope {
  configuration?: string
}

interface LogServerTargetConfiguration {
  password?: string
  httpPassword?: string
}

const parseJsonObject = <T>(value: unknown): T | undefined => {
  if (!value || typeof value !== 'string') {
    return undefined
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return undefined
  }
}

export const decryptLogServerConfigurationPayload = (
  payload: AddLogServerActionParam
): AddLogServerActionParam => {
  const envelope = parseJsonObject<LogServerConfigurationEnvelope>(payload.configuration)
  const targetConfig = parseJsonObject<LogServerTargetConfiguration>(envelope?.configuration)

  if (!envelope?.configuration || (!targetConfig?.password && !targetConfig?.httpPassword)) {
    return payload
  }

  const decryptedTargetConfig = {
    ...targetConfig,
    ...(targetConfig.password ? { password: Decrypt(targetConfig.password) } : {}),
    ...(targetConfig.httpPassword ? { httpPassword: Decrypt(targetConfig.httpPassword) } : {})
  }

  return {
    ...payload,
    configuration: JSON.stringify({
      ...envelope,
      configuration: JSON.stringify(decryptedTargetConfig)
    })
  }
}

export const callLogServerActionWithEncryptedRecord = async (
  action: AddLogServerAction,
  params: AddLogServerActionParam,
  info: ActionInfo
): Promise<AddLogServerResult> => {
  const { actionId, sessionId, apiId, apiRecord } = await action.preAction(
    info,
    true,
    AddLogServerAction.name,
    params
  )
  const actionInfo = {
    ...info,
    apiId,
    actionId,
    sessionId
  }

  try {
    const result = await action.call(
      decryptLogServerConfigurationPayload(params),
      actionInfo,
      false
    )

    await action.recordSuccess(result, apiRecord, actionInfo)
    return result
  } catch (error) {
    await action.recordFailed(error, apiRecord, actionInfo)
    throw error
  }
}
