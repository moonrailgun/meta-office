import axios from 'axios';

export const endpoint = process.env.ENDPOINT ?? 'http://127.0.0.1:3000';

const request = axios.create({
  baseURL: endpoint,
});

/**
 * 获取用户登录信息
 * @param code 登录预授权码
 */
export const getUserInfo = async (code: string) => {
  const { data } = await request.get('/userInfo', {
    params: {
      code,
    },
  });

  return data;
};
