import { intToIp, ipToInt } from '@/utils'

export function getIpAfterAddIndex(ip: string, index: number): string {
  const isIpv6: boolean = ip.indexOf(':') > -1
  if (isIpv6) {
    const eachByteOfIp: string[] = ip.split(':')
    eachByteOfIp[eachByteOfIp.length - 1] = (
      parseInt(eachByteOfIp[eachByteOfIp.length - 1], 16) + index
    ).toString(16)
    const tmpIp: string = eachByteOfIp.join(':')
    return tmpIp
  } else {
    return intToIp(ipToInt(ip) + index)
  }
}

export function getMacAfterAddIndex(macAddress: string, index: number): string {
  const eachByteOfMac: string[] = macAddress.split(':')
  eachByteOfMac[eachByteOfMac.length - 1] = (
    parseInt(eachByteOfMac[eachByteOfMac.length - 1], 16) + index
  ).toString(16)
  const tmpMac: string = eachByteOfMac.map(it => (it.length === 1 ? `0${it}` : it)).join(':')
  return tmpMac
}
