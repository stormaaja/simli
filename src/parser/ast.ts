import { Reader } from "./reader"
import { isWhitespace, isBracket } from "./tokens"
import { ASTNode } from "../ast/ast_node"
import { createValueNode } from "../ast/value_node"
import { FNCallNode } from "../ast/function_node"

function parseSymbol(reader: Reader): string {
  let symbol = ""
  while (
    reader.hasTokens() &&
    !isWhitespace(reader.peek()) &&
    !isBracket(reader.peek())
  ) {
    symbol += reader.next()
  }
  return symbol
}

function parseString(reader: Reader): string {
  let str = reader.next()
  while (reader.hasTokens()) {
    const token = reader.next()
    if (token === "\\") {
      str += reader.next()
    } else if (token === '"') {
      return str + token
    } else {
      str += token
    }
  }
  throw new Error("Error parsing string")
}

function parseComment(reader: Reader) {
  while (reader.hasTokens() && reader.next() !== "\n") {}
}

export function parseASTElement(reader: Reader): ASTNode {
  const children: ASTNode[] = []
  let nextToken = null
  let open = !reader.atStart()
  const openPosition = reader.position()
  while (reader.hasTokens()) {
    nextToken = reader.peek()
    if (nextToken === ";") {
      parseComment(reader)
    } else if (isWhitespace(nextToken)) {
      reader.next()
    } else if (nextToken === "(") {
      reader.next()
      children.push(parseASTElement(reader))
    } else if (nextToken === ")") {
      open = false
      reader.next()
      return new FNCallNode(children, {
        start: openPosition,
        end: reader.position(),
        file: reader.file
      })
    } else if (nextToken === "[") {
      reader.next()
      children.push(parseASTElement(reader))
    } else if (nextToken === "]") {
      open = false
      reader.next()
      return new ASTNode("array", children, {
        start: openPosition,
        end: reader.position(),
        file: reader.file
      })
    } else if (nextToken === `"`) {
      children.push(createValueNode(parseString, reader))
    } else {
      children.push(createValueNode(parseSymbol, reader))
    }
  }
  if (open) {
    throw new Error(
      `Unexpected token ${nextToken} at ${reader.line}:${reader.column}
       starting from ${openPosition.line}:${openPosition.column}.
       Perhaps missing closing brackets?`
    )
  }
  return new ASTNode("block", children, {
    start: openPosition,
    end: reader.position(),
    file: reader.file
  })
}
