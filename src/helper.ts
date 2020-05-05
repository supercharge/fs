'use strict'

import Crypto from 'crypto'

/**
 * Generates a random string with 32 characters.
 *
 * @returns {String}
 */
export function random (): string {
  return Crypto
    .randomBytes(256)
    .toString('hex')
    .slice(0, 32)
}

/**
 * Determine whether the given `date` is an instance of `Date`.
 *
 * @param {Date} date
 *
 * @returns {Boolean}
 */
export function isDate (date: Date): boolean {
  return date instanceof Date
}
