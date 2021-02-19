import {
  Nid,
  SanoNode
} from './types'

import {
  sanoNodeMap,
  newNid
} from './dao/sano-node'

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
  if(!sanoNodeMap[nid]) {
    ctx.status = 404
    return
  }

  //响应
  ctx.body = sanoNodeMap[nid]
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
  const resData: Record<Nid, SanoNode> = {}
  const nids = ctx.query.nids
    .split(',')
    .map(nid => nid.toUpperCase())
  for(const nid of nids) {
    const node = sanoNodeMap[nid]
    if(node) {
      resData[nid] = node
    }
  }

  //响应
  ctx.body = resData
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
  const targetNode = sanoNodeMap[nid]
  if(!targetNode) {
    ctx.status = 404
    return
  }

  //构建响应内容
  const resData: Record<Nid, SanoNode> = {}
  resData[nid] = targetNode
  const nids = targetNode.children
  for(const _nid of nids) {
    const node = sanoNodeMap[_nid]
    if(node) {
      resData[_nid] = node
    }
  }

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
  const content: string = reqbody.content
  const parent: string = reqbody.parent
  const username: string | undefined = reqbody.username

  //检查目标父节点是否存在
  const parentNode = sanoNodeMap[parent]
  if(!parentNode) {
    ctx.status = 406
    return
  }

  //生成新节点
  const depth = parentNode.depth + 1
  const nid = newNid(content, parent, depth)
  const newNode: SanoNode = {
    content,
    parent,
    depth,
    nid,
    children: [],
    time: Date.now(),
    username
  }

  //存入
  parentNode.children.push(nid)
  sanoNodeMap[nid] = newNode

  //响应
  ctx.body = {
    nid
  }
})

export default app
