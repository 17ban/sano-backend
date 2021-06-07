export type Nid = string

export type ContentType = 'text' | 'md'

export interface SanoNode {
  nid: Nid
  depth: number
  index: number
  type: ContentType
  content: string
  parent: Nid
  children: Nid[]
  time: number
  nickname?: string
}

export type SanoNodeMap = Record<string, SanoNode | undefined>
