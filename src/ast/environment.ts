import { PositionRange } from "./position"
import { ASTNode } from "./ast_node"

interface LineError {
  id: string
  node: ASTNode
  details?: string
}

export interface Environment {
  symbols: { [key: string]: ASTNode }
  errors: LineError[]
  location: PositionRange
}

export function createError(
  node: ASTNode,
  errorId: string,
  details?: string
): LineError {
  return {
    node: node,
    id: errorId,
    details: details
  }
}
