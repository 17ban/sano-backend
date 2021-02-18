export type Nid = string

export interface SanoNode<NID extends Nid = Nid> {
  nid: NID,
  depth: number,
  content: string,
  parent: Nid,
  children: Nid[],
  time: number,
  username?: string
}

export type SanoNodeMap<UNION_NID extends Nid = Nid> = {
  [NID in UNION_NID]?: SanoNode<NID>
}
