import { exec } from 'child_process'
import { promisify } from 'util'

import * as _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'

const promisifyExec = promisify(exec)

export function genUuid(): string {
  return uuidv4().replace(/-/g, '')
}

export function extractTask(rootTask) {
  const walk = t => {
    const newTask: any = {
      service: t.service,
      state: t.state
    }
    if (t.children) {
      newTask.children = []
      t.children.forEach(subTask => {
        newTask.children.push(walk(subTask))
      })
    }
    return newTask
  }
  return walk(rootTask)
}

export function ipToInt(ip: string): number {
  let _Number = 0
  const _ip: string[] = ip.split('.')
  _Number =
    Number(_ip[0]) * 256 * 256 * 256 +
    Number(_ip[1]) * 256 * 256 +
    Number(_ip[2]) * 256 +
    Number(_ip[3])
  _Number = _Number >>> 0
  return _Number
}

export function intToIp(num: number): string {
  const _Array: number[] = []
  _Array[0] = (num >>> 24) >>> 0
  _Array[1] = ((num << 8) >>> 24) >>> 0
  _Array[2] = (num << 16) >>> 24
  _Array[3] = (num << 24) >>> 24
  return `${String(_Array[0])}.${String(_Array[1])}.${String(_Array[2])}.${String(_Array[3])}`
}

export function formatRFC3339(d: Date): string {
  function pad(n) {
    return n < 10 ? '0' + n : n
  }

  function timezoneOffset(offset) {
    let sign: string = undefined
    if (offset === 0) {
      return 'Z'
    }
    sign = offset > 0 ? '-' : '+'
    offset = Math.abs(offset)
    return sign + pad(Math.floor(offset / 60)) + ':' + pad(offset % 60)
  }

  return (
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    'T' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes()) +
    ':' +
    pad(d.getSeconds()) +
    timezoneOffset(d.getTimezoneOffset())
  )
}

export async function execCommand(command: string) {
  const isDev = process.env.NODE_ENV === 'development'
  if (isDev) {
    const remoteHost = process.env.ZS_MN_SERVER.match(/\/(([0-9]+|\.)+):/)[1]
    command = `sshpass -p password ssh -o StrictHostKeyChecking=no root@${remoteHost} "${command}"`
  }
  return await promisifyExec(command)
}

// 定义一个函数，用于解析带单位或不带单位的大小字符串，并返回其字节表示。
export const convertSizeToBytes = (sizeStr: string): number => {
  // 确保输入是一个非空字符串
  if (_.isEmpty(sizeStr)) {
    throw new Error('sizeStr cannot be empty')
  }

  // 单位到字节的转换映射表
  const unitMap: { [unit: string]: number } = {
    B: 1,
    K: 1024,
    M: 1024 * 1024,
    G: 1024 * 1024 * 1024,
    T: 1024 * 1024 * 1024 * 1024
  }

  // 使用lodash的words来尝试分割大小和单位
  const words = _.words(sizeStr.toUpperCase(), /[0-9]+|[A-Z]+/g)
  const size = parseInt(words[0], 10) // 第一个词应该是数字
  const unit = words.length > 1 ? words[1] : 'B' // 如果有第二个词，则视为单位，否则单位是'B'

  // 验证大小是否是有效的数值
  if (_.isNaN(size)) {
    throw new Error('Invalid size number')
  }

  // 如果单位不在映射表中，默认为字节
  const sizeInBytes: number = size * (unitMap[unit] || unitMap['B'])

  return sizeInBytes
}
