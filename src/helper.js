'use strict'

const Crypto = require('crypto')

/**
 * Generates a random string with 32 characters.
 *
 * @returns {String}
 */
exports.random = function random () {
  return Crypto
    .randomBytes(256)
    .toString('hex')
    .slice(0, 32)
}
