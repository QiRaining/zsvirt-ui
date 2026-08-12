import { describe, it, expect } from "vitest";

import { Encrypt, Decrypt, isEncrypted } from "../../common/aes-cipher";

describe("AES Cipher", () => {
  it("should encrypt and decrypt text correctly", () => {
    const originalText = "test message";
    const encrypted = Encrypt(originalText);
    const decrypted = Decrypt(encrypted);

    expect(decrypted).toBe(originalText);
  });

  it("should detect encrypted text", () => {
    const originalText = "test message";
    const encrypted = Encrypt(originalText);

    expect(isEncrypted(encrypted)).toBe(true);
    expect(isEncrypted(originalText)).toBe(false);
  });
});
