import { exec as execCb, spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

import dayjs from 'dayjs'

export const exec = promisify(execCb)

export async function spawnAsync(command: string, args?: string[]) {
  const process = spawn(command, args)
  await new Promise<void>((resolve, reject) => {
    const stderr: string[] = []
    let rejected = false
    process.on('error', err => {
      rejected = true
      reject(err)
    })
    process.on('exit', code => {
      if (rejected) {
        return
      }
      if (code !== 0) {
        reject(new Error(stderr.join('')))
      } else {
        resolve()
      }
    })
    process.stderr.on('data', data => {
      stderr.push(String(data))
    })
  })
}

export interface IMvFileOption {
  unlink: boolean
}

export function mvFile(
  src: string,
  destDir: string,
  destName: string,
  option: Partial<IMvFileOption> = {}
) {
  const { unlink = true } = option
  fs.mkdirSync(destDir, { recursive: true })
  fs.copyFileSync(src, path.join(destDir, destName))
  if (unlink) {
    fs.unlinkSync(src)
  }
}

function decode(codeUnits: number[]) {
  return new TextDecoder().decode(Uint8Array.from(codeUnits))
}

export function convertUtf8CodeUnits(raw: string) {
  let index = 0
  let codeUnits = []
  const result = []
  while (index < raw.length) {
    if (raw[index] === '\\') {
      index += 1
      codeUnits.push(parseInt(raw.slice(index, index + 2), 16))
      index += 2
    } else {
      if (codeUnits.length) {
        result.push(decode(codeUnits))
        codeUnits = []
      }
      result.push(raw[index])
      index += 1
    }
  }
  if (codeUnits.length) {
    result.push(decode(codeUnits))
  }
  return result.join('')
}

export function formatDate(date?: Date) {
  return date
    ? dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    : dayjs(new Date().toISOString()).format('YYYY-MM-DD HH:mm:ss')
}

export function validateCert(cert: string) {
  return /^-----BEGIN CERTIFICATE-----.+-----END CERTIFICATE-----$/s.test(cert.trim())
}

export function validatePrivatekey(privatekey: string) {
  return /^-----BEGIN .*PRIVATE KEY-----.+-----END .*PRIVATE KEY-----$/s.test(privatekey.trim())
}

export function validateChain(chain?: string) {
  if (!chain?.trim()) {
    return true
  }
  return validateCert(chain)
}

export interface ICertInput {
  pub: string
  pri: string
  chain?: string
}

export function formatCert({ pub, pri, chain }: ICertInput) {
  let result = `${pri.trim()}\n${pub.trim()}\n`
  if (chain?.trim()) {
    result = `${result}${chain.trim()}\n`
  }
  return result
}

export function ensureCertFormat(cert: ICertInput, errorMessage?: string) {
  if (!validateCert(cert.pub) || !validatePrivatekey(cert.pri) || !validateChain(cert.chain)) {
    throw new Error(errorMessage ?? 'invalid format')
  }
  return formatCert(cert)
}
