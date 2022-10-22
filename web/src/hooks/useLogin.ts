import { useCallback, useState } from 'react';
import { UserInfo } from '../type';
import { feishuSDK } from '../sdk';
import { getConfigParameters } from '../api';

export function useLogin() {
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [loggingIn, setLoggingIn] = useState(false);

  const login = useCallback(async () => {
    setLoggingIn(true);

    if (!feishuSDK.valid()) {
      alert('Please open in feishu!');
      return;
    }

    try {
      const {
        data: { appId, timestamp, nonceStr, signature },
      } = await getConfigParameters();

      // 通过error接口处理API验证失败后的回调
      window.h5sdk.error((err: any) => {
        throw 'h5sdk error:' + JSON.stringify(err);
      });

      window.h5sdk.config({
        appId,
        timestamp,
        nonceStr,
        signature,
        jsApiList: [],
        onSuccess: (res: any) => {
          console.log(`Auth success: ${JSON.stringify(res)}`);
        },
        onFail: (err: any) => {
          throw `Auth failed: ${JSON.stringify(err)}`;
        },
      });

      // 完成鉴权后，便可在 window.h5sdk.ready 里调用 JSAPI
      feishuSDK.h5sdk.ready(() => {
        // 调用 getUserInfo API 获取已登录用户的基本信息，详细文档参见https://open.feishu.cn/document/uYjL24iN/ucjMx4yNyEjL3ITM
        feishuSDK.tt.getUserInfo({
          // getUserInfo API 调用成功回调
          success(res: any) {
            console.log('success', res);
            setUserInfo(res);
          },
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
    } finally {
      setLoggingIn(false);
    }
  }, []);

  return { userInfo, loggingIn, login };
}
