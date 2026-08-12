import { Inject } from '@nestjs/common'

export const loggerNames: string[] = new Array<string>()

export function Logger(name = '') {
  if (!loggerNames.includes(name)) {
    loggerNames.push(name)
  }
  return Inject(`LoggerService${name}`)
}
