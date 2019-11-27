import fs from "fs"

export function fileExists(filePath: string) {
  return fs.existsSync(filePath)
}

export class Reader {
  content: string
  i: number
  line: number
  column: number
  file: string

  constructor(file: string) {
    this.file = file
    this.content = fs.readFileSync(file, { encoding: "UTF-8" })
    this.i = 0
    this.line = 1
    this.column = 1
  }

  peek() {
    return this.content.charAt(this.i)
  }

  peekAfter() {
    return this.content.charAt(this.i + 1)
  }

  next() {
    if (this.peek() === "\n") {
      this.line++
      this.column = 1
    } else {
      this.column++
    }
    return this.content.charAt(this.i++)
  }

  hasTokens() {
    return this.i < this.content.length
  }

  position() {
    return { line: this.line, column: this.column }
  }

  atStart() {
    return this.i === 0
  }
}
