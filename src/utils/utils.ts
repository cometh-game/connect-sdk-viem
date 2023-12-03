import { toHex } from 'viem'

export const sleep = async (msInterval: number): Promise<void> => {
  return await new Promise((resolve) => setTimeout(resolve, msInterval))
}

/* eslint-disable */
export function deepHexlify(obj: any): any {
  if (typeof obj === 'function') {
    return undefined
  }
  if (obj == null || typeof obj === 'string' || typeof obj === 'boolean') {
    return obj
  } else if (typeof obj === 'bigint') {
    return toHex(obj)
  } else if (obj._isBigNumber != null || typeof obj !== 'object') {
    return toHex(obj).replace(/^0x0/, '0x')
  }
  if (Array.isArray(obj)) {
    return obj.map((member) => deepHexlify(member))
  }
  return Object.keys(obj).reduce(
    /* eslint-disable */
    (set: any, key: string) => {
      set[key] = deepHexlify(obj[key])
      return set
    },
    {}
  )
}
