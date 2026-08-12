import * as CryptoJS from 'crypto-js'

const prefix = 'crypt_key_for_v1::'
const key = CryptoJS.enc.Utf8.parse(CryptoJS.MD5('ZStack open source').toString())
function Decrypt(word) {
  try {
    const decryptedData = CryptoJS.AES.decrypt(word, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    const msg = decryptedData.toString(CryptoJS.enc.Utf8)
    const result = msg.indexOf(prefix) > -1 ? msg.split(prefix)[1] : msg
    return word !== '' && result === '' ? word : result
  } catch (e) {
    console.error(`Decrypt fail: ${e}`)
    return word
  }
}

function Encrypt(word: string) {
  try {
    const encryptedData = CryptoJS.AES.encrypt(word, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    const msg = encryptedData.toString()
    return word !== '' && msg === '' ? word : msg
  } catch (e) {
    console.error(`Encrypt fail: ${e}`)
    return word
  }
}

function isEncrypted(word) {
  return Decrypt(word) !== word
}

export { Decrypt, isEncrypted, Encrypt }
