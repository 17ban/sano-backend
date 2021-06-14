import CryptoJS from 'crypto-js'
import base32Encode from 'base32-encode'
import fs from 'fs'

import {
  isMarkdown,
  markdownToHtml
} from '../utils/index'

import {
  SanoNid,
  SanoNode,
  SanoNodeRecord,
  SanoNodeContentType,
  SanoNodeBundle
} from '../types'


const _nodesRecord = JSON.parse(fs.readFileSync('./data/nodes.json', 'utf-8'))
if(typeof _nodesRecord !== 'object') {
  throw new Error(`Can't read nodes.json.`)
}

const _updateDelay = 500
let _hasUpdate = false
let _updateFlag = false

setInterval(() => {
  if(_hasUpdate) {
    if(_updateFlag) {
      _hasUpdate = false
      _updateFlag = false
      fs.writeFileSync('./data/nodes.json', JSON.stringify(_nodesRecord, undefined, 2))
    } else {
      _updateFlag = true
    }
  }
}, _updateDelay)

export const sanoNodeRecord: SanoNodeRecord = 
  new Proxy(_nodesRecord as Record<SanoNid, SanoNode>, {
    get(target, property, receiver) {
      return target[<string>property]
    },
    set(target, property, value, receiver) {
      target[<string>property] = value
      _hasUpdate = true
      _updateFlag = false
      return true
    }
  })



function hash(str: string): string {
  const hashWordArray = CryptoJS.SHA256(str)
  const { buffer } = new Int32Array(hashWordArray.words)
  const hashStr = base32Encode(buffer, 'Crockford')
  return hashStr
}


export function newNid(content: string, parent: SanoNid, depth: number): string {
  //生成 nid
  const nid = hash(content + parent + Date.now())
    .slice(8, depth > 1 ? 16 : 12)
  //防止 id 重复
  if(sanoNodeRecord[nid]) {
    return newNid(content + nid, parent, depth)
  } else {
    return nid
  }
}

export function getNode<NID extends SanoNid>(nid: NID): SanoNode<NID> | undefined {
  return sanoNodeRecord[nid] as SanoNode<NID> | undefined
}

export function getNodes<NID extends SanoNid>(nids: NID[]): SanoNode<NID>[] {
  const nodes = []
  for (const nid of nids) {
    const node = getNode(nid)
    if (node) nodes.push(node)
  }
  return nodes
}

export function getNodebundle<NID extends SanoNid>(nid: NID): SanoNodeBundle<NID> | undefined {
  const mainNode = getNode(nid)
  if(!mainNode) return undefined
  const childNodes = getNodes(mainNode.children)
  return { mainNode, childNodes }
}

export function newNode(parent: SanoNid, content: string, nickname?: string): SanoNid | false {
  // check parent node
  const parentNode = getNode(parent)
  if(!parentNode) return false

  // check whether the content is a markdown text
  let type: SanoNodeContentType = 'text'
  if (isMarkdown(content)) {
    type = 'md'
    content = markdownToHtml(content)
  }

  // create new node
  const depth = parentNode.depth + 1
  const nid = newNid(content, parent, depth)
  const newNode: SanoNode = {
    nid,
    nickname,
    content,
    type,
    parent,
    depth,
    index: parentNode.children.length,
    children: [],
    time: Date.now(),
  }

  // save the new node
  parentNode.children.push(nid)
  sanoNodeRecord[nid] = newNode

  // return the nid of new node
  return nid
}

const stickyNids = JSON.parse(fs.readFileSync('./data/sticky-nids.json', 'utf-8'))
export function getStickyNids() {
  return stickyNids
}
