export type Nid = string

export interface SanoNode {
  nid: Nid,
  depth: number,
  content: string,
  parent: Nid,
  children: Nid[],
  time: number,
  username?: string
}
