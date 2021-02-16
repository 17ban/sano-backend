import {
  Nid,
  SanoNode
} from '../types'

import CryptoJS from 'crypto-js'
import base32Encode from 'base32-encode'
import fs from 'fs'



const _nodesMap = JSON.parse(fs.readFileSync('./data/nodes.json', 'utf-8'))
if(typeof _nodesMap !== 'object') {
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
      fs.writeFileSync('./data/nodes.json', JSON.stringify(_nodesMap, undefined, 2))
    } else {
      _updateFlag = true
    }
  }
}, _updateDelay)

export const sanoNodeMap: Record<Nid, SanoNode | undefined> = 
  new Proxy(_nodesMap as Record<Nid, SanoNode>, {
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


export function newNid(content: string, parent: Nid, depth: number): string {
  //生成 nid
  const nid = hash(content + parent + Date.now())
    .slice(8, depth > 1 ? 16 : 12)
  //防止 id 重复
  if(sanoNodeMap[nid]) {
    return newNid(content + nid, parent, depth)
  } else {
    return nid
  }
}
