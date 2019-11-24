import { PositionRange } from "./position"
import { Environment } from "./environment"

export class ASTNode {
  type: string
  children: ASTNode[]
  location: PositionRange

  constructor(type: string, children: ASTNode[], location: PositionRange) {
    this.type = type
    this.children = children
    this.location = location
  }

  eval(env: Environment, args: ASTNode[] = []): ASTNode | null {
    const results = this.children.map(c => c.eval(env, args))
    return results[results.length - 1]
  }
}
