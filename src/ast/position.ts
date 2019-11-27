export interface Position {
  line: number
  column: number
}

export interface PositionRange {
  start?: Position
  end?: Position
  file?: string
}
