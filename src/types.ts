export type SanoNid = string

export type SanoNodeContentType = 'text' | 'md'

export interface SanoNode {
  nid: SanoNid
  depth: number
  index: number
  type: SanoNodeContentType
  content: string
  parent: SanoNid
  children: SanoNid[]
  time: number
  nickname?: string
}

export type SanoNodeMap = Record<string, SanoNode | undefined>

export type SanoNodeBundle = {
  mainNode: SanoNode
  childNodes: SanoNode[]
}
