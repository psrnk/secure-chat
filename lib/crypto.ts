// Function to encrypt a message using the Web Crypto API
export async function encryptMessage(message: string, key: string): Promise<string> {
  try {
    // Convert the key to a format usable by the Web Crypto API
    const encoder = new TextEncoder()
    const keyData = encoder.encode(key)

    // Create a key from the provided string
    const cryptoKey = await window.crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, ["encrypt"])

    // Generate a random initialization vector
    const iv = window.crypto.getRandomValues(new Uint8Array(12))

    // Encrypt the message
    const messageData = encoder.encode(message)
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      cryptoKey,
      messageData,
    )

    // Combine the IV and encrypted data
    const result = new Uint8Array(iv.length + encryptedData.byteLength)
    result.set(iv)
    result.set(new Uint8Array(encryptedData), iv.length)

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...result))
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt message")
  }
}

// Function to decrypt a message using the Web Crypto API
export async function decryptMessage(encryptedMessage: string, key: string): Promise<string> {
  try {
    // Convert the base64 string back to a Uint8Array
    const encryptedData = Uint8Array.from(atob(encryptedMessage), (c) => c.charCodeAt(0))

    // Extract the IV (first 12 bytes)
    const iv = encryptedData.slice(0, 12)

    // Extract the actual encrypted data
    const data = encryptedData.slice(12)

    // Convert the key to a format usable by the Web Crypto API
    const encoder = new TextEncoder()
    const keyData = encoder.encode(key)

    // Create a key from the provided string
    const cryptoKey = await window.crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, ["decrypt"])

    // Decrypt the message
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      cryptoKey,
      data,
    )

    // Convert the decrypted data back to a string
    const decoder = new TextDecoder()
    return decoder.decode(decryptedData)
  } catch (error) {
    console.error("Decryption error:", error)
    throw new Error("Failed to decrypt message. Incorrect key?")
  }
}

