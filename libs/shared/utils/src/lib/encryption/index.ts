/**
 * Interface for encrypted data structure
 */
interface EncryptedData {
  cipherText: string
  iv: string
  salt: string
}

/**
 * Convert ArrayBuffer to hexadecimal string
 *
 * @param buffer - The ArrayBuffer to convert
 * @returns Hexadecimal string representation
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Convert hexadecimal string to ArrayBuffer
 *
 * @param hex - The hexadecimal string to convert
 * @returns ArrayBuffer representation
 */
function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes.buffer
}

/**
 * Generate a CryptoKey from a password for use with PBKDF2
 *
 * @param password - Password to convert to key material
 * @returns Promise resolving to a CryptoKey
 */
async function getCryptoKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = encoder.encode(password)
  return crypto.subtle.importKey('raw', keyMaterial, { name: 'PBKDF2' }, false, ['deriveKey'])
}

/**
 * Derive an encryption key from a password and salt using PBKDF2
 *
 * @param password - The password to derive from
 * @param salt - The salt for key derivation
 * @returns Promise resolving to a CryptoKey for AES-GCM
 */
async function deriveKey(password: string, salt: ArrayBuffer): Promise<CryptoKey> {
  const keyMaterial = await getCryptoKey(password)
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt text using AES-GCM with a password
 *
 * @param text - Plain text to encrypt
 * @param password - Password for encryption
 * @returns Promise resolving to encrypted data object
 */
async function encryptText(text: string, password: string): Promise<EncryptedData> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt)

  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, encoder.encode(text))

  return {
    cipherText: arrayBufferToHex(encrypted),
    iv: arrayBufferToHex(iv),
    salt: arrayBufferToHex(salt),
  }
}

/**
 * Decrypt text using AES-GCM with a password
 *
 * @param encryptedData - Object containing encrypted data and parameters
 * @param password - Password for decryption
 * @returns Promise resolving to decrypted text
 */
async function decryptText(encryptedData: EncryptedData, password: string): Promise<string> {
  const { cipherText, iv, salt } = encryptedData
  const key = await deriveKey(password, hexToArrayBuffer(salt))

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: hexToArrayBuffer(iv) },
    key,
    hexToArrayBuffer(cipherText)
  )

  const decoder = new TextDecoder()
  return decoder.decode(decrypted)
}

/**
 * Class-based implementation for encryption utilities
 */
class CryptoUtils {
  /**
   * Encrypt text using a password
   *
   * @param text - Plain text to encrypt
   * @param password - Password for encryption
   * @returns Promise resolving to encrypted data
   */
  static async encrypt(text: string, password: string): Promise<EncryptedData> {
    return encryptText(text, password)
  }

  /**
   * Decrypt encrypted data using a password
   *
   * @param encryptedData - Object containing encrypted data and parameters
   * @param password - Password for decryption
   * @returns Promise resolving to decrypted text
   */
  static async decrypt(encryptedData: EncryptedData, password: string): Promise<string> {
    return decryptText(encryptedData, password)
  }
}

export { CryptoUtils, EncryptedData }
