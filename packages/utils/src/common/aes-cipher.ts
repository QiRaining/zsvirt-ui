import CryptoJS from "crypto-js";

/**
 * 加密配置类型
 */
interface CryptoConfig {
  mode: typeof CryptoJS.mode.ECB;
  padding: typeof CryptoJS.pad.Pkcs7;
}

/**
 * 加密服务类
 */
class AESCipher {
  private static instance: AESCipher;
  private readonly prefix = "crypt_key_for_v1::";
  private readonly key: CryptoJS.lib.WordArray;
  private readonly config: CryptoConfig;

  private constructor() {
    this.key = CryptoJS.enc.Utf8.parse(
      CryptoJS.MD5("ZStack open source").toString(),
    );
    this.config = {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    };
  }

  public static getInstance(): AESCipher {
    if (!AESCipher.instance) {
      AESCipher.instance = new AESCipher();
    }
    return AESCipher.instance;
  }

  /**
   * 解密字符串
   */
  public decrypt(word: string): string {
    if (!word) return word;

    try {
      const decryptedData = CryptoJS.AES.decrypt(word, this.key, this.config);
      const msg = decryptedData.toString(CryptoJS.enc.Utf8);
      const result = msg.includes(this.prefix)
        ? msg.split(this.prefix)[1]
        : msg;

      return result || word;
    } catch (error) {
      console.error(
        "Decrypt failed:",
        error instanceof Error ? error.message : "Unknown error",
      );
      return word;
    }
  }

  /**
   * 加密字符串
   */
  public encrypt(word: string): string {
    if (!word) return word;

    try {
      const encryptedData = CryptoJS.AES.encrypt(
        `${this.prefix}${word}`,
        this.key,
        this.config,
      );
      const msg = encryptedData.toString();

      return msg || word;
    } catch (error) {
      console.error(
        "Encrypt failed:",
        error instanceof Error ? error.message : "Unknown error",
      );
      return word;
    }
  }

  /**
   * 检查字符串是否已加密
   */
  public isEncrypted(word: string): boolean {
    return this.decrypt(word) !== word;
  }
}

const cipher = AESCipher.getInstance();

export const Decrypt = (word: string): string => cipher.decrypt(word);
export const Encrypt = (word: string): string => cipher.encrypt(word);
export const isEncrypted = (word: string): boolean => cipher.isEncrypted(word);

export { AESCipher };
