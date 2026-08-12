import _ from 'lodash'

export function formatDateUTC(date) {
  return date
    .toISOString()
    .replace(/T/, ' ') // 将 T 替换为空格
    .replace(/\..+/, '') // 删除小数点及之后的内容
}

export const formatStorage = (value?: number | string, decimal: number = 0): string => {
  // 类型检查: 如果 value 不是数字，也不能转换成数字，返回 '-'
  if (typeof value !== 'number' && _.isNaN(Number(value))) {
    return '-'
  }
  const { number, unit } = formatStorageToObj(value, decimal)
  return `${number} ${unit}`
}

const formatStorageToObj = (
  value?: number | string,
  decimal: number = 0,
  suffixUnit: string = 'B'
): { number: number | string; unit: string } => {
  // 类型检查: 如果 value 不是数字，也不能转换成数字，返回 '-'
  if (typeof value !== 'number' && _.isNaN(Number(value))) {
    return {
      number: '-',
      unit: ''
    }
  }
  const unitArr = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'] as const
  const numberValue = Number(value)
  if (numberValue <= 0) {
    return {
      number: 0,
      unit: `${unitArr[0]}${suffixUnit}`
    }
  }
  let unitIndex = 0
  let sizeNumber = numberValue
  while (sizeNumber >= 1024 && unitIndex < unitArr.length - 1) {
    sizeNumber /= 1024
    unitIndex++
  }
  return {
    number: Number(sizeNumber.toFixed(decimal)),
    unit: `${unitArr[unitIndex]}${suffixUnit}`
  }
}
