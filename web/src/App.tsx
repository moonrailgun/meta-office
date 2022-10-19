import { useCallback, useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import { Doc } from 'yjs';
import { SocketIOProvider } from 'y-socket.io';
import { endpoint, request } from './api';
import { feishuSDK } from './sdk';
import './App.css';

const roomId = 'any-room-id';
const doc = new Doc();
const provider = new SocketIOProvider(endpoint, roomId, doc, {});
const data = doc.getMap<number>('data');

provider.on('status', ({ status }: { status: string }) => {
  console.log(status); // Logs "connected" or "disconnected"
});

function App() {
  const [count, setCount] = useState(0);
  const [remote, setRemote] = useState(-1);

  useEffect(() => {
    data.set('count', count);
  }, [count]);

  useEffect(() => {
    setRemote(data.get('count') ?? -1);

    data.observe((e) => {
      setRemote(e.target.get('count') ?? -1);
    });
  }, []);

  const handleLogin = useCallback(async () => {
    if (!feishuSDK.valid()) {
      console.log('invalid h5sdk');
      alert('please open in feishu');
      return;
    }

    try {
      const { data } = await request.get('/getConfigParameters', {
        params: {
          url: encodeURIComponent(location.href.split('#')[0]),
        },
      });

      // 通过error接口处理API验证失败后的回调
      window.h5sdk.error((err: any) => {
        throw 'h5sdk error:' + JSON.stringify(err);
      });
      // 调用config接口进行鉴权
      window.h5sdk.config({
        appId: data.appId,
        timestamp: data.timestamp,
        nonceStr: data.noncestr,
        signature: data.signature,
        jsApiList: [],
        //鉴权成功回调
        onSuccess: (res: any) => {
          console.log(`config success: ${JSON.stringify(res)}`);
        },
        //鉴权失败回调
        onFail: (err: any) => {
          throw `config failed: ${JSON.stringify(err)}`;
        },
      });
      // 完成鉴权后，便可在 window.h5sdk.ready 里调用 JSAPI
      feishuSDK.h5sdk.ready(() => {
        // window.h5sdk.ready回调函数在环境准备就绪时触发
        // 调用 getUserInfo API 获取已登录用户的基本信息，详细文档参见https://open.feishu.cn/document/uYjL24iN/ucjMx4yNyEjL3ITM
        feishuSDK.tt.getUserInfo({
          // getUserInfo API 调用成功回调
          success(res: any) {
            console.log(`getUserInfo success: ${JSON.stringify(res)}`);
            alert(`getUserInfo success: ${JSON.stringify(res)}`);
            // 单独定义的函数showUser，用于将用户信息展示在前端页面上
            // showUser(res.userInfo);
          },
          // getUserInfo API 调用失败回调
          fail(err: any) {
            alert(`getUserInfo failed: ${JSON.stringify(err)}`);
          },
        });
        // 调用 showToast API 弹出全局提示框，详细文档参见https://open.feishu.cn/document/uAjLw4CM/uYjL24iN/block/api/showtoast
        feishuSDK.tt.showToast({
          title: '鉴权成功',
          icon: 'success',
          duration: 3000,
          success(res: any) {
            console.log('showToast 调用成功', res.errMsg);
          },
          fail(res: any) {
            console.log('showToast 调用失败', res.errMsg);
          },
          complete(res: any) {
            console.log('showToast 调用结束', res.errMsg);
          },
        });
      });
    } catch (err) {
      console.error(err);
      alert(String(err));
    }
  }, []);

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <button onClick={handleLogin}>免密登录</button>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>Remote Count: {remote}</p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
