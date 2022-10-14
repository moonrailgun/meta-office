import Koa from 'koa';
import Router from '@koa/router';
import http from 'http';
import { Server } from 'socket.io';
import { YSocketIO } from 'y-socket.io/dist/server';

const app = new Koa();
const router = new Router();
const server = http.createServer(app.callback());
const io = new Server(server);
const ysocketio = new YSocketIO(io);

ysocketio.initialize();

router.get('/', (ctx, next) => {
  ctx.body = 'Hello World';
});

app.use(router.routes()).use(router.allowedMethods());

server.listen(3000, () => {
  console.log('http://localhost:3000');
});
