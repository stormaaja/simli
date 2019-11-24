import { parseASTElement } from "./ast"
import { Reader } from "./reader"

export function parse(reader: Reader) {
  return parseASTElement(reader)
}
