import { PositionRange } from "./position"
import { ASTNode } from "./ast_node"

interface LineError {
  position: PositionRange
}

export interface Environment {
  symbols: { [key: string]: ASTNode }
  errors: LineError[]
  location: PositionRange
}
