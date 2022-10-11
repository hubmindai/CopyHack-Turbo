//
//
// Imports
// ############################################
const crypto = require('crypto')

//
//
// Methods
// ############################################
const algorithm = 'aes-256-ctr'
const secretKey = process.env.CRYPTO_KEY
const iv = crypto.randomBytes(16)

exports.encryptString = (text) => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv)

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])

  return JSON.stringify({
    iv: iv.toString('hex'),
    content: encrypted.toString('hex')
  })
}

exports.decryptString = (hash) => {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'))

  const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()])

  return decrypted.toString()
}

exports.generateRandomString = (length = 32, charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz') => {
  const randomString = new Array(length)
    .fill(null)
    .map(() => charset.charAt(crypto.randomInt(charset.length)))
    .join('')

  return randomString
}
