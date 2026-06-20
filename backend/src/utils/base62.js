import { randomInt } from 'node:crypto';

const ALPHABET =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = ALPHABET.length;

// Encode a non-negative integer to a Base62 string.
export function encode(num) {
  if (num === 0) return ALPHABET[0];
  let str = '';
  let n = num;
  while (n > 0) {
    str = ALPHABET[n % BASE] + str;
    n = Math.floor(n / BASE);
  }
  return str;
}

// Generate a random Base62 short code of the given length.
export function randomCode(length = 7) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET[randomInt(BASE)];
  }
  return code;
}

// Validate a user-supplied alias: Base62 chars only, sane length.
export function isValidAlias(alias) {
  return /^[0-9a-zA-Z]{3,32}$/.test(alias);
}
