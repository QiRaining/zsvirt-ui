import * as fs from 'fs'
import * as net from 'net'
import * as os from 'os'
import * as path from 'path'
import * as tls from 'tls'

import dayjs from 'dayjs'
import { pick } from 'lodash'

import { CertInfo } from '../cert-manage.model'
import { formatDate, exec, spawnAsync } from './common'

declare module 'tls' {
  interface Certificate {
    emailAddress: string
  }
  interface PeerCertificate {
    bits?: number
  }
}

function getCertObj(cert: string) {
  const secureContext = tls.createSecureContext({ cert })
  const sock = new tls.TLSSocket(new net.Socket(), { secureContext })
  const certObj = sock.getCertificate()
  sock.destroy()
  return certObj as tls.PeerCertificate
}

function formatCertAttr(value?: string | string[]) {
  return Array.isArray(value) ? value.join(',') : value
}

export async function parseCert(certPath: string) {
  const result: CertInfo = {}
  const certObj = getCertObj(fs.readFileSync(certPath).toString())
  result.issueCN = formatCertAttr(certObj.issuer?.CN)
  result.C = formatCertAttr(certObj.issuer?.C)
  result.O = formatCertAttr(certObj.issuer?.O)
  result.OU = formatCertAttr(certObj.issuer?.OU)
  result.ST = formatCertAttr(certObj.issuer?.ST)
  result.L = formatCertAttr(certObj.issuer?.L)
  result.emailAddress = certObj.issuer?.emailAddress
  result.subCN = formatCertAttr(certObj.subject?.CN)
  result.subC = formatCertAttr(certObj.subject?.C)
  result.subO = formatCertAttr(certObj.subject?.O)
  result.subOU = formatCertAttr(certObj.subject?.OU)
  result.subST = formatCertAttr(certObj.subject?.ST)
  result.subEmailAddress = certObj.subject?.emailAddress
  result.issueTime = formatDate(new Date(certObj.valid_from))
  result.expireTime = formatDate(new Date(certObj.valid_to))
  result.fingerprint = certObj.fingerprint256
  result.serial = certObj.serialNumber
  result.bits = certObj.bits
  const raw = (await exec(`openssl x509 -in '${certPath}' -text -noout`)).stdout
  result.signatureAlgorithm = raw.match(/Signature Algorithm:(.*)/)?.[1].trim()
  result.version = raw.match(/Version:(.*)/)?.[1].trim()
  result.keyAlgorithm = raw.match(/Public Key Algorithm:(.*)/)?.[1].trim()

  const now = new Date().getTime()
  const expireTime = new Date(result.expireTime).getTime()
  const issueTime = new Date(result.issueTime).getTime()
  result.duration = dayjs(expireTime)
    .add(1, 'day') // 向上取整
    .diff(dayjs(now), 'day')
    .toString()
  result.validating = expireTime > now && now > issueTime

  return result
}

export async function verifyCert(content: string) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zstack-ui-server-'))
  const certPath = path.join(tempDir, 'cert.pem')
  fs.writeFileSync(certPath, content)
  fs.chmodSync(certPath, 0o600)

  await exec(`openssl pkey -in '${certPath}' -noout -check -passin pass:do-not-set-password`)
  const { stdout: pubkeyInPrivatekey } = await exec(`openssl pkey -in '${certPath}' -pubout`)
  const { stdout: pubkey } = await exec(`openssl x509 -in '${certPath}' -pubkey -noout`)
  if (pubkey !== pubkeyInPrivatekey) {
    throw new Error('private key and public key mismatch')
  }
  const chain = content.split('-----BEGIN CERTIFICATE-----').slice(1).reverse()
  if (chain.length > 1) {
    const prevCertPath = path.join(tempDir, 'prev.pem')
    const currCertPath = path.join(tempDir, 'curr.pem')
    for (let i = 0; i < chain.length - 1; i++) {
      fs.writeFileSync(prevCertPath, `-----BEGIN CERTIFICATE-----${chain[i]}`)
      fs.writeFileSync(currCertPath, `-----BEGIN CERTIFICATE-----${chain[i + 1]}`)
      await exec(
        `openssl verify -x509_strict -partial_chain -trusted ${prevCertPath} ${currCertPath}`
      )
    }
  }
  return certPath
}

export interface ISubject {
  CN: string
  O: string
  OU: string
  C: string
  ST: string
  L: string
  emailAddress: string
}

function escapeValue(value: string) {
  return value.replace(/([~`@#$%^&*()\-_+={}[\]|:;'<>,.?/\\])/g, '\\$1')
}

function formatSubject(subj: Partial<ISubject>) {
  return Object.entries(pick(subj, 'CN', 'O', 'OU', 'C', 'ST', 'L', 'emailAddress'))
    .filter(item => item[1])
    .map(([key, val]) => {
      return `/${key}=${escapeValue(val as string)}`
    })
    .join('')
}

function formatSubjectAltName(names: string[]) {
  const ipAddrRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/
  const value = names
    .filter(item => item)
    .map(item => {
      if (!ipAddrRegex.test(item)) {
        return `DNS:${escapeValue(item)}`
      }
      return `IP:${item},DNS:${item}`
    })
    .join(',')
  return value ? `subjectAltName=${value}` : ''
}

export interface IGenerateCertOption {
  certPath: string
  days: number
  subject: Partial<ISubject>
  nodeIps: string[]
}

export async function generateCert({ certPath, days, subject, nodeIps }: IGenerateCertOption) {
  const subj = formatSubject(subject) || '/CN='
  const san = formatSubjectAltName([subject.CN, ...nodeIps])
  const args = [
    'req',
    '-x509',
    '-utf8',
    '-nodes',
    '-newkey',
    'rsa:2048',
    '-keyout',
    certPath,
    '-out',
    certPath,
    '-days',
    `${days}`,
    '-subj',
    subj
  ]
  if (san) {
    args.push('-addext', san)
  }
  await spawnAsync('openssl', args)
}

export interface IGenerateCsrOption {
  certPath: string
  subject?: Partial<ISubject>
}

export async function generateCsr({ certPath, subject = {} }: IGenerateCsrOption) {
  const subj = formatSubject(subject) || '/CN=localhost/O=localhost'
  const args = [
    'req',
    '-new',
    '-utf8',
    '-nodes',
    '-newkey',
    'rsa:2048',
    '-keyout',
    path.join(certPath, 'out.key'),
    '-out',
    path.join(certPath, 'out.csr'),
    '-subj',
    subj
  ]
  await spawnAsync('openssl', args)
}
