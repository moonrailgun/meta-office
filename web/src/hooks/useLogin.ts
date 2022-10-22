import { useCallback, useState } from 'react';
import { UserInfo } from '../type';
import { endpoint, getUserInfo } from '../api';
import { message } from 'antd';
import { fakeUserInfo } from '../const';

export function useLogin() {
  const [userInfo, setUserInfo] = useState<UserInfo>(fakeUserInfo);

  const login = useCallback(async () => {
    const win = window.open(
      `${endpoint}/auth?redirectUrl=${encodeURIComponent(
        location.origin + '/oauth.html'
      )}`,
      'oauth-window',
      'width=414,height=736'
    );

    if (!win) {
      message.error('登录窗口被拦截, 请取消拦截后重试');
      return;
    }

    const handleProcessOAuthCallback = async (event: MessageEvent<any>) => {
      if (event.data?.['type'] === 'onOAuthFinished') {
        const code = event.data['code'];

        const userInfo = await getUserInfo(code);

        // 登录成功
        setUserInfo({
          id: userInfo.union_id,
          name: userInfo.name,
          avatar: userInfo.avatar_url,
        });

        message.success('登录成功');

        window.removeEventListener('message', handleProcessOAuthCallback);
      }
    };

    window.addEventListener('message', handleProcessOAuthCallback);
  }, []);

  return { userInfo, login };
}
