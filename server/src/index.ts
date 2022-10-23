import Koa from 'koa';
import Router from '@koa/router';
import logger from 'koa-logger';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { YSocketIO } from 'y-socket.io/dist/server';
import * as dotenv from 'dotenv';
import { Auth } from './auth';
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
ysocketio.on('socket-disconnect', (socket: Socket) => {
  try {
    const { roomId, userId } = socket.handshake.auth;
    console.log('disconnect', { roomId, userId });

    // if (!roomId || !userId) {
    //   return;
    // }
    if (!userId) {
      return;
    }

    const userMap = ysocketio.documents.get(roomId).getMap('User');
    userMap.delete(userId);
  } catch (err) {
    console.error(err);
  }
});
ysocketio.on('document-destroy', (doc: Document) => {
  console.log('document-destroy', doc);
});

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

router.get('/auth', async (ctx) => {
  const redirectUrl = encodeURIComponent(String(ctx.query.redirectUrl));
  const { url: authUrl, state } = auth.getAuthUrl(redirectUrl);
  console.log('authUrl', authUrl);

  ctx.redirect(authUrl);
});

router.get('/userInfo', async (ctx) => {
  const code = String(ctx.query.code);

  ctx.body = await auth.getUserInfo(code);
});

app.use(router.routes()).use(router.allowedMethods());

server.listen(3000, () => {
  console.log('服务端已启动: http://localhost:3000');
});
