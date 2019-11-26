import { ASTNode } from "./ast_node"
import { PositionRange } from "./position"
import { Reader } from "../parser/reader"
import { Environment } from "./environment"

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

  eval(env: Environment, args: ASTNode[] = []): ASTNode | null {
    if (this.type === "symbol") {
      return env.symbols[this.value].eval(env, args)
    } else {
      return this
    }
  }
}

const rInteger = /^\d+$/
const rFloat = /^\d+\.\d+$/

function isInteger(s: string) {
  return s.match(rInteger) !== null
}

function isFloat(s: string) {
  return s.match(rFloat) !== null
}

function getType(s: string) {
  if (s.startsWith('"')) {
    return "constString"
  } else if (isInteger(s)) {
    return "constInteger"
  } else if (isFloat(s)) {
    return "constFloat"
  } else {
    return "symbol"
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
