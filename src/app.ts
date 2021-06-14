import type {
  SanoNodeContentType,
  SanoNode,
  SanoNodeBundle
} from './types'

import {
  sanoNodeRecord,
  newNid,
  getStickyNids
} from './dao/sano-node'

import {
  isMarkdown,
  markdownToHtml
} from './utils/index'

import koa, { ExtendableContext } from 'koa'



function matchRoute(ctx: ExtendableContext, method: string, path: string) {
  return (ctx.method === method && ctx.path === path)
}


//实例化 koa app
const app = new koa()


//解析请求的 body
import koaBody from 'koa-body'
app.use(koaBody())



app.use((ctx, next) => {
  if(!matchRoute(ctx, 'GET', '/api/node')) {
    return next()
  }

  //检查必要参数
  if(!(typeof ctx.query.nid === 'string')) {
    ctx.status = 400
    return
  }
  const nid = ctx.query.nid.toUpperCase()

  //检查目标 node 是否存在
  if(!sanoNodeRecord[nid]) {
    ctx.status = 404
    return
  }

  //响应
  ctx.body = sanoNodeRecord[nid]
})



app.use((ctx, next) => {
  if(!matchRoute(ctx, 'GET', '/api/nodes')) {
    return next()
  }

  //检查必要参数
  if(!(typeof ctx.query.nids === 'string')) {
    ctx.status = 400
    return
  }

  //构建响应内容
  const nids = ctx.query.nids
    .split(',')
    .map(nid => nid.toUpperCase())
  const nodes = []  
  for(const nid of nids) {
    const node = sanoNodeRecord[nid]
    if(node) nodes.push(node)
  }

  //响应
  ctx.body = nodes
})

app.use((ctx, next) => {
  if(!matchRoute(ctx, 'GET', '/api/sticky-nids')) {
    return next()
  }

  //构建响应内容
  const nodes = getStickyNids()

  //响应
  ctx.body = nodes
})

app.use((ctx, next) => {
  if(!matchRoute(ctx, 'GET', '/api/nodebundle')) {
    return next()
  }

  //检查必要参数
  if(!(typeof ctx.query.nid === 'string')) {
    ctx.status = 400
    return
  }
  const nid = ctx.query.nid.toUpperCase()

  //检查目标是否存在
  const mainNode = sanoNodeRecord[nid]
  if(!mainNode) {
    ctx.status = 404
    return
  }

  //构建响应内容
  const childNodes = []
  for(const nid of mainNode.children) {
    const childNode = sanoNodeRecord[nid]
    if(childNode) childNodes.push(childNode)
  }
  const resData: SanoNodeBundle = { mainNode, childNodes }

  //响应
  ctx.body = resData
})


app.use((ctx, next) => {
  if(!matchRoute(ctx, 'POST', '/api/node')) {
    return next()
  }

  //检查必要参数
  const reqbody = ctx.request?.body
  if(!(
    reqbody &&
    typeof reqbody?.content === 'string' &&
    reqbody.content.length > 0 &&
    typeof reqbody?.parent === 'string'
  )) {
    ctx.status = 400
    return
  }
  let content: string = reqbody.content
  const parent: string = reqbody.parent
  const nickname: string | undefined = reqbody.nickname

  //检查目标父节点是否存在
  const parentNode = sanoNodeRecord[parent]
  if(!parentNode) {
    ctx.status = 406
    return
  }

  // 检查 content 是否为 markdown 文本
  let type: SanoNodeContentType = 'text'
  if (isMarkdown(content)) {
    type = 'md'
    content = markdownToHtml(content)
  }

  //生成新节点
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

  //存入
  parentNode.children.push(nid)
  sanoNodeRecord[nid] = newNode

  //响应
  ctx.body = {
    nid
  }
})

export default app
