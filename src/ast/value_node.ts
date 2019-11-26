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

  getTypedValue(): string | number {
    switch (this.type) {
      case "constString":
        return this.value
      case "constInteger":
        return parseInt(this.value)
      case "constFloat":
        return parseFloat(this.value)
      default:
        throw new Error(`Unknown type ${this.type} with value ${this.value}`)
    }
  }
}

export function createValueNode(
  fn: (reader: Reader) => string,
  reader: Reader
) {
  const start = reader.position()
  const value = fn(reader)
  const end = reader.position()
  const type = getType(value)
  return new ValueNode(type, value, { start, end })
}
