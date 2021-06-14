import {
  getNode,
  getNodes,
  getNodebundle,
  getStickyNids,
  newNode
} from './dao/sano-node'

import koa, { ExtendableContext } from 'koa'
import koaBody from 'koa-body'

const app = new koa()
app.use(koaBody())

function matchRoute(ctx: ExtendableContext, method: string, path: string) {
  return (ctx.method === method && ctx.path === path)
}

/**
 * GET /api/node
 */
app.use((ctx, next) => {
  if(!matchRoute(ctx, 'GET', '/api/node')) {
    return next()
  }
  // check params
  if(!(typeof ctx.query.nid === 'string')) {
    ctx.status = 400
    return
  }
  // response
  const nid = ctx.query.nid.toUpperCase()
  const node = getNode(nid)
  if(!node) {
    ctx.status = 404
    return
  }
  ctx.body = node
})

/**
 * GET /api/nodes
 */
app.use((ctx, next) => {
  if(!matchRoute(ctx, 'GET', '/api/nodes')) {
    return next()
  }
  // check params
  if(!(typeof ctx.query.nids === 'string')) {
    ctx.status = 400
    return
  }
  // response
  const nids = ctx.query.nids
    .split(',')
    .map(nid => nid.toUpperCase())
  const nodes = getNodes(nids)
  ctx.body = nodes
})

/**
 * GET /api/sticky-nids
 */
app.use((ctx, next) => {
  if(!matchRoute(ctx, 'GET', '/api/sticky-nids')) {
    return next()
  }
  // response
  ctx.body = getStickyNids()
})

/**
 * GET /api/nodebundle
 */
app.use((ctx, next) => {
  if(!matchRoute(ctx, 'GET', '/api/nodebundle')) {
    return next()
  }
  // check params
  if(!(typeof ctx.query.nid === 'string')) {
    ctx.status = 400
    return
  }
  // response
  const nid = ctx.query.nid.toUpperCase()
  const nodebundle = getNodebundle(nid)
  if (!nodebundle) {
    ctx.status = 404
    return
  }
  ctx.body = nodebundle
})

/**
 * POST /api/node
 */
app.use((ctx, next) => {
  if(!matchRoute(ctx, 'POST', '/api/node')) {
    return next()
  }
  // check params
  const reqbody: Record<string, string | undefined> = ctx.request.body
  if (!(reqbody instanceof Object)) {
    ctx.status = 500
    return
  }
  const { content, parent, nickname } = reqbody
  if(!(content && parent)) {
    ctx.status = 400
    return
  }
  // response
  const nid = newNode(parent, content, nickname)
  if (!nid) {
    ctx.status = 406
    return
  }
  //响应
  ctx.body = { nid }
})

export default app
