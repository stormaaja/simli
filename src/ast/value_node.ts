import { ASTNode } from "./ast_node"
import { PositionRange } from "./position"
import { Reader } from "../parser/reader"

export class ValueNode extends ASTNode {
  value: string
  constructor(type: string, value: string, location: PositionRange) {
    super(type, [], location)
    this.value = value
  }

  toString() {
    return this.value
  }
}

export function createValueNode(
  type: string,
  fn: (reader: Reader) => string,
  reader: Reader
) {
  const start = reader.position()
  const value = fn(reader)
  const end = reader.position()
  return new ValueNode(type, value, { start, end })
}
