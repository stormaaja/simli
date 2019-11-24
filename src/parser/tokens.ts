interface Tokens {
  [key: string]: boolean
}

const whiteSpaces: Tokens = {
  " ": true,
  ",": true,
  "\n": true
}

const brackets: Tokens = {
  "(": true,
  ")": true
}

export function isWhitespace(c: string) {
  return whiteSpaces[c]
}

export function isBracket(s: string) {
  return brackets[s]
}
