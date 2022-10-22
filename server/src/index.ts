import Koa from 'koa';
import Router from '@koa/router';
import logger from 'koa-logger';
import http from 'http';
import { Server } from 'socket.io';
import { YSocketIO } from 'y-socket.io/dist/server';
import * as dotenv from 'dotenv';
import { Auth } from './auth';
import { sha1 } from './utils';
import cors from '@koa/cors';
dotenv.config();

const app = new Koa();
const router = new Router();
const server = http.createServer(app.callback());
const io = new Server(server);
const ysocketio = new YSocketIO(io);

app.use(logger());
app.use(cors());

ysocketio.initialize();

// 随机字符串，用于签名生成加密使用
// const NONCE_STR = Date.now().toString();
const NONCE_STR = '13oEviLbrTo458A3NjrOwS70oTOXVOAm';

const feishuHost = process.env.FEISHU_HOST;
const appId = process.env.APP_ID;
const appSecret = process.env.APP_SECRET;

if (!feishuHost || !appId || !appSecret) {
  throw new Error('env lose');
}

const auth = new Auth(feishuHost, appId, appSecret);

router.get('/', (ctx, next) => {
  ctx.body = 'Hello World';
});

router.get('/getConfigParameters', async (ctx, next) => {
  const url = decodeURIComponent(String(ctx.query.url));
  const ticket = await auth.getTicket();
  const timestamp = Date.now();
  const verifyStr = `jsapi_ticket=${ticket}&noncestr=${NONCE_STR}&timestamp=${timestamp}&url=${url}`;

  // 将鉴权所需参数返回给前端
  ctx.body = {
    appId,
    signature: sha1(verifyStr),
    nonceStr: NONCE_STR,
    timestamp,
  };
});

app.use(router.routes()).use(router.allowedMethods());

server.listen(3000, () => {
  console.log('http://localhost:3000');
});
