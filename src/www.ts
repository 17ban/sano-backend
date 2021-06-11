import http2 from 'http2'
import http from 'http'
import fs from 'fs'

import cfg from './cfg'
import app from './app'

// 处理启动参数
let httpPort = process.env.HTTP_PORT
let httpsPort = process.env.HTTPS_PORT
const args = process.argv.slice(2)
for(let i = 0; i < args.length; i++) {
  let arg = args[i]
  if(arg === '--http') {
    if(!isNaN(Number(args[i + 1]))) {
      httpPort = args[++i]
    }
  } else if(arg === '--https') {
    if(!isNaN(Number(args[i + 1]))) {
      httpsPort = args[++i]
    }
  }
}

// 启动 https 服务
if(httpsPort) {
  const http2Server = http2.createSecureServer({
    allowHTTP1: true,
    cert: fs.readFileSync(cfg.sslCrtPath),
    key: fs.readFileSync(cfg.sslKeyPath)
  }, app.callback())
  http2Server.listen(httpsPort)
}

// 启动 http 服务
if(httpPort || !(httpPort || httpsPort)) {
  const httpServer = http.createServer(app.callback())
  httpServer.listen(httpPort || 80)
}
